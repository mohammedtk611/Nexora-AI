import json
import asyncio
from typing import AsyncGenerator, Dict, Any

class EventBroadcaster:
    def __init__(self):
        self._subscribers: Dict[str, list] = {}

    def subscribe(self, job_id: str) -> asyncio.Queue:
        if job_id not in self._subscribers:
            self._subscribers[job_id] = []
        queue = asyncio.Queue()
        self._subscribers[job_id].append(queue)
        return queue

    def unsubscribe(self, job_id: str, queue: asyncio.Queue):
        if job_id in self._subscribers and queue in self._subscribers[job_id]:
            self._subscribers[job_id].remove(queue)
            if not self._subscribers[job_id]:
                del self._subscribers[job_id]

    def emit(self, job_id: str, event_type: str, data: Dict[str, Any]):
        if job_id in self._subscribers:
            event_payload = {
                "event": event_type,
                "data": data
            }
            for q in self._subscribers[job_id]:
                try:
                    q.put_nowait(event_payload)
                except Exception:
                    pass

event_broadcaster = EventBroadcaster()

async def sse_generator(job_id: str) -> AsyncGenerator[str, None]:
    queue = event_broadcaster.subscribe(job_id)
    try:
        # Initial ping
        yield f"event: ping\ndata: {json.dumps({'status': 'connected'})}\n\n"
        while True:
            try:
                msg = await asyncio.wait_for(queue.get(), timeout=20.0)
                yield f"event: {msg['event']}\ndata: {json.dumps(msg['data'])}\n\n"
            except asyncio.TimeoutError:
                yield "event: keep-alive\ndata: {}\n\n"
    except asyncio.CancelledError:
        pass
    finally:
        event_broadcaster.unsubscribe(job_id, queue)
