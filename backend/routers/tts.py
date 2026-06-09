from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
import os
import hashlib
from pathlib import Path
from models.database import User
from routers.auth import get_current_user

router = APIRouter(prefix="/tts", tags=["tts"])

TTS_CACHE_DIR = Path("tts_cache")
TTS_CACHE_DIR.mkdir(exist_ok=True)

@router.get("/speak")
async def text_to_speech(
    text: str,
    voice: str = "female",
    current_user: User = Depends(get_current_user)
):
    """Generate TTS audio for given text."""
    try:
        from gtts import gTTS
        hash_key = hashlib.md5(f"{text}{voice}".encode()).hexdigest()
        audio_path = TTS_CACHE_DIR / f"{hash_key}.mp3"

        if not audio_path.exists():
            tts = gTTS(text=text, lang='en', slow=False)
            tts.save(str(audio_path))

        return FileResponse(str(audio_path), media_type="audio/mpeg")
    except Exception as e:
        return {"error": str(e), "message": "TTS not available - using browser TTS"}
