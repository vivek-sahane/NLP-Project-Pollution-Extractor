# Browser Acceptance Report

## Environment

- Backend: FastAPI on `http://localhost:8000`
- Frontend: Next.js on `http://localhost:3000`
- Backend readiness: `200`, model status `trained_joblib`
- Frontend readiness: `200`

## Acceptance flow

| Scenario | Result |
| --- | --- |
| Open analyzer | PASS |
| Load Pune pollution preset | PASS |
| Analyze text and display entities/result cards | PASS |
| Save analysis to history | PASS |
| Search history for Pune | PASS |
| Filter history by Air Pollution | PASS |
| Filter history by From date | PASS |
| Open analysis details | PASS |
| Analyze Again populates analyzer input from query string | PASS |
| Dashboard category/source/pollutant/location charts | PASS |
| Dashboard severity distribution chart | PASS |
| Dashboard analyses-over-time chart | PASS |
| Delete a history record with confirmation | PASS |
| Model page displays evaluation metrics/confusion matrix | PASS |

## Verification notes

- The acceptance flow was executed against the running application using the integrated browser.
- Date filtering returned the expected matching records.
- The dashboard rendered both newly added chart sections with live aggregated data.
