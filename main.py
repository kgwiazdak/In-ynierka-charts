from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel

app = FastAPI()

engine = create_engine('sqlite:///json_data.db')
Base = declarative_base()

class FeatureAttribution(Base):
    __tablename__ = 'feature_attributions'

    id = Column(Integer, primary_key=True)
    action = Column(Integer)
    feature_names = Column(JSON)
    attribution = Column(JSON)

Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

class FeatureAttributionRequest(BaseModel):
    action: int
    feature_names: list
    attribution: list

# FastAPI endpoints
@app.post("/feature_attributions/")
def create_class(feature_attribution_request: FeatureAttributionRequest):
    session = Session()
    new_record = FeatureAttribution(
        action=feature_attribution_request.action,
        feature_names=feature_attribution_request.feature_names,
        attribution=feature_attribution_request.attribution
    )
    session.add(new_record)
    session.commit()
    session.close()
    return {"action": feature_attribution_request.action,
            "feature_names": feature_attribution_request.feature_names,
            "attribution": feature_attribution_request.attribution}


@app.get("/feature_attributions")
def get_all_feature_attributions():
    session = Session()
    all_feature_attribution = session.query(FeatureAttribution).all()
    session.close()
    feature_attributions = [{"action": feature_attribution.action,
                "feature_names": feature_attribution.feature_names,
                "attribution": feature_attribution.attribution} for feature_attribution in all_feature_attribution]
    return feature_attributions
