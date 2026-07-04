from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "DataMind AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    POSTGRES_SERVER: str = "postgres"
    POSTGRES_USER: str = "datamind_user"
    POSTGRES_PASSWORD: str = "datamind_password"
    POSTGRES_DB: str = "datamind_db"
    
    MONGO_SERVER: str = "mongodb"
    MONGO_PORT: str = "27017"
    MONGO_USER: str = "datamind_admin"
    MONGO_PASSWORD: str = "datamind_password"
    
    REDIS_SERVER: str = "redis"
    REDIS_PORT: str = "6379"
    
    @property
    def sqlalchemy_database_uri(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"
    
    @property
    def mongo_database_uri(self) -> str:
        return f"mongodb://{self.MONGO_USER}:{self.MONGO_PASSWORD}@{self.MONGO_SERVER}:{self.MONGO_PORT}/"
    
    @property
    def redis_uri(self) -> str:
        return f"redis://{self.REDIS_SERVER}:{self.REDIS_PORT}/0"

    class Config:
        case_sensitive = True

settings = Settings()
