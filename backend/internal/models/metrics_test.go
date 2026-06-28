package models

import (
	"encoding/json"
	"testing"
)

func TestMetricJSONEncoding(t *testing.T) {
	m := Metric{ID: 1, Name: "CPU Usage", Value: 45.2}
	data, err := json.Marshal(m)
	if err != nil {
		t.Fatalf("failed to marshal Metric: %v", err)
	}

	var decoded Metric
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("failed to unmarshal Metric: %v", err)
	}

	if decoded.ID != 1 || decoded.Name != "CPU Usage" || decoded.Value != 45.2 {
		t.Errorf("unexpected Metric values: %+v", decoded)
	}
}

func TestLanguageMetricJSONEncoding(t *testing.T) {
	lm := LanguageMetric{Name: "Scala", Value: 85}
	data, err := json.Marshal(lm)
	if err != nil {
		t.Fatalf("failed to marshal LanguageMetric: %v", err)
	}

	var decoded LanguageMetric
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("failed to unmarshal LanguageMetric: %v", err)
	}

	if decoded.Name != "Scala" || decoded.Value != 85 {
		t.Errorf("unexpected LanguageMetric values: %+v", decoded)
	}
}

func TestMetricJSONKeys(t *testing.T) {
	m := Metric{ID: 1, Name: "test", Value: 1.0}
	data, _ := json.Marshal(m)

	var raw map[string]interface{}
	json.Unmarshal(data, &raw)

	if _, ok := raw["id"]; !ok {
		t.Error("Metric JSON missing 'id' key")
	}
	if _, ok := raw["name"]; !ok {
		t.Error("Metric JSON missing 'name' key")
	}
	if _, ok := raw["value"]; !ok {
		t.Error("Metric JSON missing 'value' key")
	}
}

func TestLanguageMetricJSONKeys(t *testing.T) {
	lm := LanguageMetric{Name: "Go", Value: 70}
	data, _ := json.Marshal(lm)

	var raw map[string]interface{}
	json.Unmarshal(data, &raw)

	if _, ok := raw["name"]; !ok {
		t.Error("LanguageMetric JSON missing 'name' key")
	}
	if _, ok := raw["val"]; !ok {
		t.Error("LanguageMetric JSON missing 'val' key")
	}
}

func TestMetricZeroValues(t *testing.T) {
	m := Metric{}
	if m.ID != 0 || m.Name != "" || m.Value != 0.0 {
		t.Errorf("zero Metric should have zero values: %+v", m)
	}
}

func TestLanguageMetricZeroValues(t *testing.T) {
	lm := LanguageMetric{}
	if lm.Name != "" || lm.Value != 0.0 {
		t.Errorf("zero LanguageMetric should have zero values: %+v", lm)
	}
}
