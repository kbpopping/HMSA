#!/usr/bin/env bash
curl -s -X POST http://localhost:5678/webhook/confirm   -H 'Content-Type: application/json'   -d '{"appointment_id": 1, "status": "confirmed"}'
