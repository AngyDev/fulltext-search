const express = require("express");
const router = express.Router();

const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: "http://localhost:9200" });

router.use((req, res, next) => {
    client.index({
        index: 'logs',
        body: {
            url: req.url,
            method: req.method,
        }
    })
        .then(res => {
            console.log('Logs indexed')
        })
        .catch(err => {
            console.log(err)
        })
    next();
});

/**
 * Searches quotes by term
 */
router.get("/search", (req, res) => {

    const searchText = req.query.term;
    const limit = req.query.limit;
    const offset = req.query.offset;

    client.search({
        index: "quote_idx",
        body: {
            from: offset,
            size: limit,
            query: {
                match: { "quote": searchText.trim() }
            }
        }
    })
        .then(resp => {

            const values = resp.body.hits.hits.map((hit) => {
                return {
                    author: hit._source.Author,
                    quote: hit._source.quote
                }
            });

            return res.status(200).json({
                quotes: values,
                total: resp.body.hits.total.value
            });
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({
                msg: "Error",
                err
            });
        })
})

/**
 * Searches quotes by author
 */
router.get("/by-author", (req, res) => {
    const searchText = req.query.author;
    const limit = req.query.limit || 1000;
    const offset = req.query.offset || 0;

    client.search({
        index: "quote_idx",
        body: {
            from: offset,
            size: limit,
            query: {
                match: { "Author": searchText.trim() }
            }
        }
    })
        .then(resp => {

            const values = resp.body.hits.hits.map((hit) => {
                return hit._source.quote
            });

            return res.status(200).json({
                quotes: values,
                total: resp.body.hits.total.value
            });
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({
                msg: "Error",
                err
            });
        })
})


module.exports = router;