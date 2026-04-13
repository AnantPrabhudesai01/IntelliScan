# 🧠 AI Training & Model Tuning (Super Admin)

> **Page Route**: `/admin/ai-training`  
> **Component**: `AiTrainingTuningSuperAdmin.jsx`  
> **Access Level**: Super Admin Only

---

## 📖 Overview
The AI Training & Tuning console is the Super Admin's control center for the Gemini-powered OCR engine. It provides real-time accuracy metrics, model version management, training dataset upload, hyperparameter tuning, and A/B test configuration — enabling platform-wide AI performance optimization without redeploying the application.

---

## 🛠️ Technical Workflow

### 1. Model Performance Dashboard
- **Active Models**: Lists all deployed Gemini model versions with their accuracy, latency, and deployment status.
- **Confidence Distribution**: Visualizes the distribution of OCR confidence scores across all scans.
- **Error Analysis**: Categorizes extraction errors by field (name, email, phone, company).

### 2. Training Data Management
- **Dataset Upload**: Super Admins upload labeled training datasets (image + ground-truth JSON) to refine the OCR engine.
- **Validation Split**: Automatically splits data into training/validation sets (80/20).
- **API**: `POST /api/admin/ai/training-data` for dataset upload.

### 3. Hyperparameter Tuning
- **Temperature Control**: Adjusts the AI model's creativity vs. precision balance.
- **Confidence Threshold**: Sets the minimum score for auto-accepting extracted data.
- **API**: `PUT /api/admin/ai/config` persists tuning parameters.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `EnginePerformance` | Link | Shares the same performance metrics data source |
| `ScanPage` | Feature | All scan results are influenced by the active model configuration |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Continuous Improvement** | AI accuracy improves over time with new training data |
| **Hot-Swap Models** | Switch between model versions without downtime |
| **Quality Control** | Error analysis identifies systematic extraction failures |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `ai_models` | SELECT/UPDATE | Lists and activates model versions |
| `training_datasets` | INSERT | Stores uploaded labeled training data |
| `ai_config` | SELECT/UPDATE | Reads and persists hyperparameter settings |
| `scans` | SELECT (aggregate) | Sources confidence and error distribution metrics |
