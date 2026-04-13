# 🤖 Custom AI Models Management (Super Admin)

> **Page Route**: `/admin/custom-models`  
> **Component**: `CustomModelsPage.jsx`  
> **Access Level**: Super Admin Only

---

## 📖 Overview
The Custom Models page allows Super Admins to register, configure, and manage alternative AI model endpoints beyond the default Gemini integration. This supports multi-model architectures where different OCR engines can be A/B tested or assigned to specific workspaces based on their scanning needs (e.g., a specialized model for Asian language business cards).

---

## 🛠️ Technical Workflow

### 1. Model Registration
- **Create**: Registers a new model with name, API endpoint, authentication key, and supported languages.
- **Configuration**: Sets per-model parameters like timeout, fallback behavior, and confidence threshold.

### 2. Model Routing
- **Workspace Assignment**: Specific workspaces can be assigned to use a custom model instead of the global default.
- **Fallback Chain**: If a custom model fails or returns low confidence, the system falls back to the default Gemini engine.

### 3. Performance Comparison
- **Side-by-Side Metrics**: Compares accuracy, latency, and error rates across all registered models.
- **A/B Test Results**: Shows statistically significant performance differences between model versions.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `AiTrainingTuning` | Feature | Shares model performance data sources |
| `EnginePerformance` | Feature | Provides latency and throughput metrics per model |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Multi-Model Architecture** | Different OCR engines for different use cases |
| **Enterprise Customization** | Large customers can deploy their own fine-tuned models |
| **Resilience** | Fallback chains ensure zero downtime if a model fails |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `custom_models` | INSERT/SELECT/UPDATE/DELETE | Full CRUD for model registrations |
| `workspace_model_assignments` | INSERT/UPDATE | Maps workspaces to specific model endpoints |
| `model_performance_logs` | SELECT | Historical accuracy and latency per model |
