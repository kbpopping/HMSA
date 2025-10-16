#!/usr/bin/env bash
curl -s -X POST http://localhost:5678/webhook/book   -H 'Content-Type: application/json'   -d '{"patient_id": 1, "clinician_id": 1, "start_time": "2025-09-25T10:00:00Z"}'
