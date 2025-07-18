export default function (url, so, pg = "", sq = "") {
    const m = [...url.matchAll(/!1s([a-zA-Z0-9_:]+)!/g)];
    if (!m || !m[0][1]) {
        throw new Error("Invalid URL");
    }
    const placeId = m[1]?.[1] ? m[1][1] : m[0][1];
    return `https://www.google.com/maps/rpc/listugcposts?authuser=0&hl=en&gl=in&pb=!1m7!1s${placeId}!3s${sq}!6m4!4m1!1e1!4m1!1e3!2m2!1i10!2s${pg}!5m2!1sBnOwZvzePPfF4-EPy7LK0Ak!7e81!8m5!1b1!2b1!3b1!5b1!7b1!11m6!1e3!2e1!3sen!4slk!6m1!1i2!13m1!1e${so}`;
}