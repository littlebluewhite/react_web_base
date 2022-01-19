from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
import shutil
import base64
from fastapi.middleware.cors import CORSMiddleware


class IMG(BaseModel):
    img: bytes


app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/IBMS/test/api/get_logo")
async def get_7days_alarm_stat_main():
    return FileResponse("out.png")


@app.post("/IBMS/test/api/upload_logo/")
async def create_upload_file(input: IMG):
    with open("imageToSave.png", "wb") as fh:
        fh.write(base64.decodebytes(input.img))

    return {"status": "ok"}


@app.post("/image")
async def image(image: UploadFile = File(...)):
    with open("idestination.png", "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    return {"filename": image.filename}


if __name__ == '__main__':
    import uvicorn

    uvicorn.run("image_res:app", host="0.0.0.0", port=9005, reload=False)

# curl -X POST "http://13.70.5.125:9005/image" -H  "accept: application/json" -H  "Content-Type: multipart/form-data" -F "image=@iris.png;type=image/png"
