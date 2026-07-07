package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"code-telemetry-engine/backend/internal/database"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/net"
)

func main() {
	database.InitDB()
	if database.GetDB() == nil {
		log.Fatal("[AGENT] Could not connect to database")
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	log.Println("[AGENT] Hardware polling agent started...")

	// Initial poll immediately
	pollAndInsert(ctx)

	for {
		select {
		case <-ticker.C:
			pollAndInsert(ctx)
		case <-quit:
			log.Println("[AGENT] Shutting down agent gracefully...")
			return
		}
	}
}

func pollAndInsert(ctx context.Context) {
	db := database.GetDB()
	if db == nil {
		return
	}

	// 1. CPU Usage (overall percent)
	cpuPercents, err := cpu.PercentWithContext(ctx, 0, false)
	var cpuVal float64
	if err == nil && len(cpuPercents) > 0 {
		cpuVal = cpuPercents[0]
	}

	// 2. Memory Usage (percent)
	vMem, err := mem.VirtualMemoryWithContext(ctx)
	var memVal float64
	if err == nil && vMem != nil {
		memVal = vMem.UsedPercent
	}

	// 3. Network IO (bytes sent + recv in MB/s)
	netStats, err := net.IOCountersWithContext(ctx, false)
	var netVal float64
	if err == nil && len(netStats) > 0 {
		totalBytes := netStats[0].BytesSent + netStats[0].BytesRecv
		netVal = float64(totalBytes) / (1024 * 1024)
	}

	// 4. Disk Activity (usage percent of root)
	diskStat, err := disk.UsageWithContext(ctx, "/")
	var diskVal float64
	if err == nil && diskStat != nil {
		diskVal = diskStat.UsedPercent
	}

	metrics := map[string]float64{
		"CPU Usage":     cpuVal,
		"Memory Usage":  memVal,
		"Network IO":    netVal,
		"Disk Activity": diskVal,
	}

	batch, err := db.PrepareBatch(ctx, "INSERT INTO system_metrics (name, value)")
	if err != nil {
		log.Printf("[AGENT ERROR] Could not prepare batch: %v", err)
		return
	}

	for name, val := range metrics {
		if err := batch.Append(name, val); err != nil {
			log.Printf("[AGENT ERROR] Could not append metric %s: %v", name, err)
			continue
		}
	}

	if err := batch.Send(); err != nil {
		log.Printf("[AGENT ERROR] Could not send batch: %v", err)
	} else {
		log.Println("[AGENT] Successfully inserted hardware metrics.")
	}
}
