import { SortEnum } from "./src/types.js";
import { validateParams, fetchReviews, paginateReviews } from "./src/utils.js";
import parseReviews from "./src/parser.js";

export async function scraper(url, { sort_type = "relevent", search_query = "", pages = "max", clean = false, cookies = process.env.GOOGLE_MAPS_COOKIES } = {}) {
    try {
        validateParams(url, sort_type, pages, clean);

        const sort = SortEnum[sort_type];
        const initialData = await fetchReviews(url, sort, "", search_query, cookies);

        if (!initialData || !initialData[2] || !initialData[2].length) return 0;

        if (!initialData[1] || pages === 1) return clean ? parseReviews(initialData[2]) : initialData[2];

        return await paginateReviews(url, sort, pages, search_query, clean, initialData, cookies);
    } catch (e) {
        console.error(e);
        return;
    }
}
