import os
import sys
import pandas as pd
import numpy as np
import json
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score, precision_recall_fscore_support, confusion_matrix

# Add parent dir to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.nlp.preprocessor import preprocessor

def run_training():
    print("==================================================")
    print("POLLUTION CLASSIFIER - TRAINING PIPELINE")
    print("==================================================")

    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    train_path = os.path.join(base_dir, "data", "train.csv")
    val_path = os.path.join(base_dir, "data", "validation.csv")
    test_path = os.path.join(base_dir, "data", "test.csv")

    models_dir = os.path.join(base_dir, "models")
    reports_dir = os.path.join(base_dir, "reports")
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(reports_dir, exist_ok=True)

    if not os.path.exists(train_path):
        print(f"[Error] Dataset not found at {train_path}")
        return

    # 1. Load Datasets
    df_train = pd.read_csv(train_path)
    df_val = pd.read_csv(val_path) if os.path.exists(val_path) else pd.DataFrame()
    df_test = pd.read_csv(test_path) if os.path.exists(test_path) else pd.DataFrame()

    print(f"Loaded Train Samples: {len(df_train)}")
    print(f"Loaded Validation Samples: {len(df_val)}")
    print(f"Loaded Test Samples: {len(df_test)}")

    # Combine train + val for model training
    train_combined = pd.concat([df_train, df_val], ignore_index=True) if not df_val.empty else df_train

    # 2. Preprocess Text
    X_train_raw = train_combined["text"].values
    y_train = train_combined["pollution_category"].values

    X_test_raw = df_test["text"].values if not df_test.empty else X_train_raw
    y_test = df_test["pollution_category"].values if not df_test.empty else y_train

    X_train_clean = [preprocessor.preprocess_for_classification(t) for t in X_train_raw]
    X_test_clean = [preprocessor.preprocess_for_classification(t) for t in X_test_raw]

    # 3. TF-IDF Feature Extraction
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=1000, sublinear_tf=True)
    X_train_vec = vectorizer.fit_transform(X_train_clean)
    X_test_vec = vectorizer.transform(X_test_clean)

    # 4. Train Classifier
    classifier = LogisticRegression(C=1.5, max_iter=500, class_weight='balanced', random_state=42)
    classifier.fit(X_train_vec, y_train)

    # 5. Evaluate
    y_pred = classifier.predict(X_test_vec)

    acc = accuracy_score(y_test, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='weighted')
    labels = list(sorted(set(y_train)))
    cm = confusion_matrix(y_test, y_pred, labels=labels)

    print("\n---------------- EVALUATION RESULTS ----------------")
    print(f"Accuracy:  {acc * 100:.2f}%")
    print(f"Precision: {precision * 100:.2f}%")
    print(f"Recall:    {recall * 100:.2f}%")
    print(f"F1-Score:  {f1 * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    # 6. Save Artifacts
    model_path = os.path.join(models_dir, "pollution_classifier.joblib")
    vec_path = os.path.join(models_dir, "tfidf_vectorizer.joblib")

    joblib.dump(classifier, model_path)
    joblib.dump(vectorizer, vec_path)
    print(f"\nSaved model -> {model_path}")
    print(f"Saved vectorizer -> {vec_path}")

    # 7. Save Report JSON
    report_dict = {
        "dataset_info": {
            "train_samples": len(df_train),
            "validation_samples": len(df_val),
            "test_samples": len(df_test),
            "total_samples": len(df_train) + len(df_val) + len(df_test)
        },
        "metrics": {
            "accuracy": round(float(acc), 4),
            "precision": round(float(precision), 4),
            "recall": round(float(recall), 4),
            "f1_score": round(float(f1), 4)
        },
        "labels": labels,
        "confusion_matrix": cm.tolist()
    }

    report_path = os.path.join(reports_dir, "classification_report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report_dict, f, indent=2)

    with open(os.path.join(reports_dir, "evaluation_summary.json"), "w", encoding="utf-8") as f:
        json.dump({
            "evaluation_type": "classification",
            "dataset": "synthetic/demo dataset",
            "metrics": report_dict["metrics"],
            "labels": labels,
        }, f, indent=2)

    try:
        import matplotlib.pyplot as plt
        fig, ax = plt.subplots(figsize=(7, 5))
        ax.imshow(cm, cmap="Greens")
        ax.set(xticks=range(len(labels)), yticks=range(len(labels)), xticklabels=labels, yticklabels=labels,
               xlabel="Predicted label", ylabel="Actual label", title="Pollution Category Confusion Matrix")
        for row_index in range(len(labels)):
            for col_index in range(len(labels)):
                ax.text(col_index, row_index, cm[row_index, col_index], ha="center", va="center")
        fig.tight_layout()
        fig.savefig(os.path.join(reports_dir, "confusion_matrix.png"), dpi=150)
        plt.close(fig)
    except ImportError:
        print("[Warning] matplotlib is not installed; confusion_matrix.png was not generated.")

    print(f"Saved evaluation report -> {report_path}")
    print("==================================================")

if __name__ == "__main__":
    run_training()
