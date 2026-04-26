"""
service.py — single place for all Anthropic API calls in Lumina.

Every function is synchronous, returns plain Python types (str, list, dict).
Views call these directly; Celery tasks can too.
"""
import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


def _client():
    import anthropic
    return anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)


def _call(system: str, user: str, max_tokens: int = 512) -> str:
    """Single-turn call. Returns the text response."""
    try:
        msg = _client().messages.create(
            model=settings.AI_MODEL,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        return msg.content[0].text.strip()
    except Exception as exc:
        logger.error("Anthropic API error: %s", exc)
        return f"[AI unavailable: {exc}]"


def ai_summarise(content: str) -> str:
    """Summarise a note in 2–3 sentences."""
    return _call(
        system="You are a concise note summariser. Return 2-3 sentences maximum. Plain text only, no markdown.",
        user=f"Summarise this note:\n\n{content[:4000]}",
    )


def ai_suggest_tags(title: str, content: str) -> list[str]:
    """Return up to 5 tag suggestions as a JSON array."""
    raw = _call(
        system='You suggest short lowercase tags for notes. Return ONLY a JSON array of strings, e.g. ["python","backend","api"]. Max 5 tags. No explanation.',
        user=f"Title: {title}\n\nContent: {content[:2000]}",
        max_tokens=128,
    )
    try:
        tags = json.loads(raw)
        return [str(t).lower().strip() for t in tags if t][:5]
    except Exception:
        return []


def ai_habit_insight(stats: list[dict]) -> str:
    """Generate a motivational weekly habit insight report."""
    stats_text = "\n".join(
        f"- {s['name']} ({s['category']}): {s['rate_30d']}% completion last 30d, current streak {s['streak']} days"
        for s in stats
    )
    return _call(
        system=(
            "You are a supportive habit coach. Write a short, motivating weekly insight report "
            "(3-5 sentences). Highlight the best performing habit, identify one area to improve, "
            "and give one actionable tip. Warm and encouraging tone."
        ),
        user=f"Here are the user's habit stats:\n{stats_text}",
        max_tokens=256,
    )


def ai_plan_day(events: list[dict], habits: list[dict], notes_summary: str) -> str:
    """Suggest a day plan given calendar events and habits."""
    events_text = "\n".join(f"- {e['title']} at {e['start_datetime']}" for e in events) or "None"
    habits_text = "\n".join(f"- {h['name']} (streak: {h.get('streak',0)}d)" for h in habits) or "None"

    return _call(
        system=(
            "You are a productivity assistant. Given the user's schedule and habits, "
            "suggest a brief, practical day plan in bullet points. Max 6 bullets."
        ),
        user=(
            f"Today's events:\n{events_text}\n\n"
            f"Active habits to track:\n{habits_text}\n\n"
            f"Recent notes context:\n{notes_summary or 'None'}"
        ),
        max_tokens=300,
    )


def ai_chat(messages: list[dict], context: dict) -> str:
    """
    Multi-turn chat with access to the user's context (notes, habits, events).
    `messages` = [{"role": "user"|"assistant", "content": str}, ...]
    """
    system = (
        "You are Lumina, an intelligent second-brain assistant. "
        "You have access to the user's notes, habits, and calendar. "
        "Be concise, practical, and helpful. Use markdown for lists when appropriate.\n\n"
        f"User context:\n"
        f"- Notes count: {context.get('notes_count', 0)}\n"
        f"- Active habits: {context.get('habit_names', [])}\n"
        f"- Upcoming events: {context.get('upcoming_events', [])}\n"
        f"- Recent note titles: {context.get('recent_notes', [])}"
    )
    try:
        msg = _client().messages.create(
            model=settings.AI_MODEL,
            max_tokens=600,
            system=system,
            messages=messages[-10:],  # keep last 10 turns
        )
        return msg.content[0].text.strip()
    except Exception as exc:
        logger.error("AI chat error: %s", exc)
        return f"Sorry, I'm having trouble right now. ({exc})"
