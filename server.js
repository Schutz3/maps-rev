import express from 'express';
import { scraper } from './scrape.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MASTER_API_KEY = process.env.API_KEY;
let reviewCount = 0;



function parseRawReviews(rawReviews) {
    if (!rawReviews || !Array.isArray(rawReviews)) {
        return [];
    }

    return rawReviews.map(reviewSet => {
        try {
            const reviewData = reviewSet[0];
            if (!reviewData) return null;

            const reviewId = reviewData[0];
            const authorBlock = reviewData[1]?.[4]?.[5];
            const contentBlock = reviewData[2];
            const dateString = reviewData[1]?.[6];
            const reviewLink = reviewData[4]?.[3]?.[0];

            if (!authorBlock) {
                return null;
            }

            const parsedReview = {
                review_id: reviewId,
                user: {
                    name: authorBlock[0],
                    link: authorBlock[2]?.[0],
                    contributor_id: authorBlock[3],
                    reviews: authorBlock[5] || 0,
                    photos: authorBlock[6] || 0,
                    thumbnail: authorBlock[1]
                },
                link: reviewLink,
                source: "Google",
                text: contentBlock?.[15]?.[0]?.[0] || null,
                rating: contentBlock?.[0]?.[0],
                date: dateString,
            };

            if (!parsedReview.user.name || !parsedReview.rating) {
                return null;
            }

            return parsedReview;
        } catch (error) {
            return null;
        }
    }).filter(Boolean);
}

async function getReviews(url, options = {}) {
    try {
        const finalOptions = { ...options, clean: false };
        const rawReviews = await scraper(url, finalOptions);
        const cleanedReviews = parseRawReviews(rawReviews);
        return cleanedReviews;
    } catch (error) {
        throw error;
    }
}

app.get('/reviews', async (req, res) => {
    const { url, key, sort_by, pages } = req.query;

    if (!key || key !== MASTER_API_KEY) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (!url) {
        return res.status(400).json({ error: "Parameter 'url' tidak boleh kosong" });
    }

    try {
        const startTime = Date.now();
        const options = { sort_type: sort_by || 'relevent', pages: pages ? parseInt(pages, 10) : 1 };
        const reviews = await getReviews(decodeURIComponent(url), options);
        
        res.json({
            search_metadata: {
                id: `search_${Math.random().toString(36).substring(2, 9)}`,
                status: "Success",
                created_at: new Date().toISOString(),
                total_time_taken: parseFloat(((Date.now() - startTime) / 1000).toFixed(2))
            },
            search_parameters: {
                engine: "Maps_reviews",
                url: decodeURIComponent(url),
                sort_by: options.sort_type,
                pages_requested: options.pages
            },
            place_result: {},
            reviews_count: reviews.length,
            reviews: reviews
        });
        reviewCount ++;
    } catch (error) {
        res.status(500).json({ error: "Gagal memproses permintaan.", details: error.message });
    }
});

app.get('/health', (req, res) => { 
    const uptime = process.uptime();
    res.json({
        status: "ok",
        uptime: Math.floor(uptime) + " seconds",
        review_count: reviewCount
    });
});

app.listen(PORT);