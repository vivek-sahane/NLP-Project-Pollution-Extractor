# Dataset Documentation

## 1. Overview
The dataset powering the **Pollution Source Extractor** is structured for academic classification and extraction experimentation.

## 2. Dataset Structure
Located in `data/`:
- `data/train.csv`: Training dataset containing 40+ structured environmental text instances.
- `data/validation.csv`: Validation dataset for hyperparameter evaluation.
- `data/test.csv`: Independent test dataset for evaluating generalization performance.

## 3. Schema Attributes
- `text`: Raw text paragraph describing a pollution incident.
- `pollution_category`: Target label (Air Pollution, Water Pollution, Soil Pollution, Noise Pollution, Other).
- `source_category`: Primary source taxonomy (Industrial Plant, Agricultural Burning, Vehicular Emissions, Sewage Discharge, Construction Site, Mining Operation, Waste Burning, Refinery, etc.).
- `pollutant`: Specific chemical or physical pollutant mentioned (PM2.5, sulfur dioxide, sewage, pesticides, heavy metals, etc.).
- `location`: Geographic entity associated with the event (Pune, Nashik, Delhi, Mumbai, etc.).
- `severity`: Explicit severity assessment (Low, Moderate, High, Critical).

## 4. Academic Integrity Note
Sample data records generated for initial training and demonstration are synthetic benchmark cases clearly demarcated with `is_demo: True`.
