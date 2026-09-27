def test_register_and_login(client):
    # 1. Register new user
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "testuser@revamp.ai",
        "password": "Password123!",
        "full_name": "Test Analyst"
    })
    assert reg_res.status_code == 201
    user_data = reg_res.json()
    assert user_data["email"] == "testuser@revamp.ai"
    assert "hashed_password" not in user_data

    # 2. Login with credentials
    login_res = client.post("/api/v1/auth/login", json={
        "email": "testuser@revamp.ai",
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # 3. Access GET /me with Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "testuser@revamp.ai"

def test_login_invalid_credentials(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "nonexistent@revamp.ai",
        "password": "WrongPassword"
    })
    assert res.status_code == 401
    assert res.json()["error"]["code"] == "AUTHENTICATION_FAILED"
