from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.risk import router as risk_router
from app.api.profile import router as profile_router

app = FastAPI(
    title='Bio Probe Risk Service',
    version='0.1.0',
    description='生物探针风控 + 用户画像 Demo'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(risk_router, prefix='/risk', tags=['risk'])
app.include_router(profile_router, prefix='/risk/profile', tags=['profile'])


@app.get('/health')
def health():
    return {'status': 'ok'}
