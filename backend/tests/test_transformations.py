from app.db.database import get_db
from app.services.transformation_service import transformation_service

def test_transformation_api_workflow(client, db):
    # 1. Create Project
    p_res = client.post("/api/v1/projects", json={"name": "Transformation Test Project"})
    proj_id = p_res.json()["id"]

    # 2. Ingest Source Text
    t_res = client.post("/api/v1/ingestion/text", json={
        "project_id": proj_id,
        "title": "Threat Feed 001",
        "text": "APT29 launched spear-phishing attacks deploying Cobalt Strike beacons on Domain Controllers."
    })
    doc_id = t_res.json()["source_document_id"]

    # 3. Create Transformation
    trans_res = client.post("/api/v1/transformations", json={
        "project_id": proj_id,
        "source_document_ids": [doc_id],
        "target_audience": "executive",
        "tone": "formal",
        "objective": "action_required",
        "urgency_level": "high",
        "language": "English",
        "output_formats": ["executive_brief", "advisory", "presentation"]
    })
    assert trans_res.status_code == 201
    trans_data = trans_res.json()
    trans_id = trans_data["transformation_id"]

    # 4. Execute Transformation Sync for Test
    transformation_service.execute_transformation_sync(db, trans_id)

    # 5. Check Job Status
    job_res = client.get(f"/api/v1/jobs/{trans_id}")
    assert job_res.status_code == 200
    assert job_res.json()["job_id"] == trans_id

    # 6. List Artifacts
    art_res = client.get(f"/api/v1/artifacts?transformation_id={trans_id}")
    assert art_res.status_code == 200
    artifacts = art_res.json()
    assert len(artifacts) >= 1

