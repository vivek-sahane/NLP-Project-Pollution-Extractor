import os
import sys

# Add parent dir to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.pollution_extractor import pollution_extractor
from app.services.database_service import db_service

DEMO_SAMPLE_TEXTS = [
    "A chemical factory near Pune released sulfur dioxide into the atmosphere, causing severe air pollution in nearby residential areas.",
    "Untreated sewage was discharged into the Godavari river near Nashik, causing high water pollution.",
    "Construction activities generated excessive dust and PM10 emissions in central Noida.",
    "Smoke from agricultural stubble burning in Punjab caused dangerous PM2.5 haze across Delhi.",
    "An explosion at a petrochemical refinery near Vadodara released toxic fumes and sulfur dioxide into the air.",
    "Heavy cargo truck traffic produced intense noise pollution and carbon monoxide near Mumbai highway.",
    "Illegal chemical waste dumping severely contaminated agricultural topsoil near an industrial estate in Thane.",
    "A paper mill discharged untreated industrial effluent into the Mula-Mutha river near Pune.",
    "Uncontrolled dust and particulate matter from limestone quarrying affected villages in Satna.",
    "Open municipal solid waste burning at a landfill near Ahmedabad caused hazardous smog.",
    "Pesticide runoff from agricultural fields contaminated drinking water wells near Bhatinda.",
    "Nighttime heavy vehicle traffic generated loud traffic noise exceeding safe decibel limits in Lucknow.",
    "Untreated domestic sewage released into the Yamuna river in Agra caused toxic foam formation.",
    "Flaring of natural gas at an oil facility released methane into the atmosphere near Kochi.",
    "Acidic runoff from a zinc smelter contaminated topsoil and farmlands near Udaipur.",
    "City bus exhaust containing nitrogen dioxide degraded urban air quality in Kolkata.",
    "Illegal electronic waste processing caused heavy metal soil contamination in Moradabad.",
    "Sludge from a wastewater treatment plant leaked into local groundwater in Coimbatore.",
    "Loudspeakers and industrial equipment generated continuous noise pollution in Jamshedpur.",
    "Coal dust emissions from open-cast mining operations reduced visibility and air quality in Dhanbad."
]

def seed_demo_records():
    print("==================================================")
    print("SEEDING DEMO POLLUTION RECORDS")
    print("==================================================")

    count = 0
    for text in DEMO_SAMPLE_TEXTS:
        analysis_res = pollution_extractor.analyze_text(text)
        analysis_res["is_demo"] = True
        
        # Build storage doc format
        doc = {
            "inputText": text,
            "source": analysis_res["source"],
            "pollutants": analysis_res["pollutants"],
            "locations": analysis_res["locations"],
            "pollutionCategory": analysis_res["pollution_category"],
            "severity": analysis_res["severity"],
            "entities": analysis_res["entities"],
            "relationships": analysis_res["relationships"],
            "summary": analysis_res["summary"],
            "confidence": analysis_res["confidence_summary"],
            "processingTimeMs": analysis_res["processing_time_ms"],
            "isDemo": True
        }

        db_service.save_analysis(doc)
        count += 1

    print(f"Successfully seeded {count} demo pollution records into database/store!")
    print("==================================================")

if __name__ == "__main__":
    seed_demo_records()
