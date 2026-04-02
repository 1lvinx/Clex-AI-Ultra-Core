package server

import (
	"encoding/json"
	"net/http"
)

// TaskRequest represents a task request
type TaskRequest struct {
	ID     string `json:"id"`
	Type   string `json:"type"`
	Prompt string `json:"prompt"`
	Inputs map[string]string `json:"inputs"`
}

// TaskResponse represents a task response
type TaskResponse struct {
	Success bool   `json:"success"`
	TaskID  string `json:"task_id"`
}

// StartHTTPServer starts the HTTP server
func StartHTTPServer(port string) {
	http.HandleFunc("/task", func(w http.ResponseWriter, r *http.Request) {
		var req TaskRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}
		
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(TaskResponse{
			Success: true,
			TaskID:  req.ID,
		})
	})
	
	http.ListenAndServe(":"+port, nil)
}
