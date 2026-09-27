def test_project_crud(client):
    # Create project
    create_res = client.post("/api/v1/projects", json={
        "name": "SIH Cyber Intelligence Project",
        "description": "Problem Statement 26154 Test Project"
    })
    assert create_res.status_code == 201
    proj = create_res.json()
    proj_id = proj["id"]
    assert proj["name"] == "SIH Cyber Intelligence Project"

    # List projects
    list_res = client.get("/api/v1/projects")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # Get project by ID
    get_res = client.get(f"/api/v1/projects/{proj_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == proj_id

    # Update project
    patch_res = client.patch(f"/api/v1/projects/{proj_id}", json={
        "name": "Updated SIH Project Name"
    })
    assert patch_res.status_code == 200
    assert patch_res.json()["name"] == "Updated SIH Project Name"

    # Delete project
    del_res = client.delete(f"/api/v1/projects/{proj_id}")
    assert del_res.status_code == 204
