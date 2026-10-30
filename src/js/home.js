// The homepage's live status and "Right now" suggestions, in UK time wherever the visitor is. Without this file the
// page shows a default set of dishes and the usual hours, and makes no claim about being open.
(function () {
  const status = document.getElementById('now-status');
  const heading = document.getElementById('now-heading');
  const data = JSON.parse(document.getElementById('now-data').textContent);
  const panels = Array.from(document.querySelectorAll('[data-moment]'));

  const toMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // 05:30 becomes 5:30am, 17:00 becomes 5pm.
  function formatTime(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return `${hours % 12 || 12}${minutes ? `:${String(minutes).padStart(2, '0')}` : ''}${hours < 12 ? 'am' : 'pm'}`;
  }

  function ukNow() {
    const parts = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date())
      .forEach((p) => { parts[p.type] = p.value; });
    return { date: `${parts.year}-${parts.month}-${parts.day}`, seconds: Number(parts.hour) * 3600 + Number(parts.minute) * 60 + Number(parts.second) };
  }

  // Works on the calendar date alone, so a clock change can't move it.
  function addDays(date, days) {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
  }
  function weekdayOf(date) {
    const [y, m, d] = date.split('-').map(Number);
    return new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)));
  }

  // known is false when the hours can't be vouched for, and then nothing says "open" or "closed".
  function hoursOn(date) {
    const exception = Object.prototype.hasOwnProperty.call(data.exceptions, date) ? data.exceptions[date] : null;
    if (exception) return exception.closed ? { known: true, closed: true } : { known: true, opens: exception.opens, closes: exception.closes };
    const usual = data.hours.find((h) => h.days.includes(weekdayOf(date)));
    if (date > data.until || data.bankHolidays.includes(date)) return { known: false, usual, bankHoliday: data.bankHolidays.includes(date) };
    return { known: true, opens: usual.opens, closes: usual.closes };
  }

  function nextOpening(date) {
    for (let days = 1; days <= 14; days += 1) {
      const next = addDays(date, days);
      const hours = hoursOn(next);
      const when = days === 1 ? 'tomorrow' : `on ${weekdayOf(next)}`;
      if (!hours.known) return { when, unknown: true };
      if (!hours.closed) return { when, opens: hours.opens };
    }
    return { unknown: true };
  }

  function closedText(date) {
    const next = nextOpening(date);
    if (next.unknown) return `Closed now. Hours may differ ${next.when || 'soon'}, so please call first.`;
    return `Closed now. Back at ${formatTime(next.opens)} ${next.when}.`;
  }

  function minutesLeftText(minutes) {
    if (minutes < 1) return 'under a minute left';
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} left`;
  }

  function setStatus(state, text, withPhone) {
    status.dataset.state = state;
    status.textContent = text;
    if (withPhone) {
      const link = document.createElement('a');
      link.href = data.phoneHref;
      link.className = 'underline underline-offset-2';
      link.textContent = data.phoneDisplay;
      status.append(' ', link);
    }
  }

  function setMoment(id, text) {
    panels.forEach((panel) => { panel.hidden = panel.dataset.moment !== id; });
    heading.textContent = text;
  }

  const momentAt = (minutes) => data.moments.find((m) => minutes < toMinutes(m.until));

  function update() {
    const { date, seconds } = ukNow();
    const minutes = Math.floor(seconds / 60);
    const hours = hoursOn(date);

    if (!hours.known) {
      if (hours.bankHoliday) setStatus('unknown', "It's a bank holiday, so hours may differ. Please call", true);
      else setStatus('unknown', `Our usual hours today: ${formatTime(hours.usual.opens)} to ${formatTime(hours.usual.closes)}.`);
      setMoment(momentAt(minutes).id, data.defaultHeading);
      return;
    }

    const isOpen = !hours.closed && minutes >= toMinutes(hours.opens) && minutes < toMinutes(hours.closes);
    if (!isOpen) {
      if (!hours.closed && minutes < toMinutes(hours.opens)) setStatus('closed', `Closed now. Back at ${formatTime(hours.opens)} today.`);
      else setStatus('closed', closedText(date));
      setMoment(data.moments[0].id, data.nextVisitHeading);
      return;
    }

    // Rounded down, so it never promises more time than there is.
    const left = Math.floor((toMinutes(hours.closes) * 60 - seconds) / 60);
    setStatus('open', left < 60 ? `Closing at ${formatTime(hours.closes)}, ${minutesLeftText(left)}.` : `Open now until ${formatTime(hours.closes)}.`);

    if (weekdayOf(date) === 'Sunday' && minutes >= toMinutes(data.roastFrom)) {
      setMoment('roast', data.roastHeading);
    } else {
      const moment = momentAt(minutes);
      setMoment(moment.id, moment.heading);
    }
  }

  update();
  setInterval(update, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
})();
