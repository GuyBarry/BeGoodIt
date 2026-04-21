/**
 * @swagger
 * /seasons:
 *   get:
 *     summary: Get all seasons
 *     description: Returns a list of all available seasons.
 *     tags:
 *       - Seasons
 *     responses:
 *       200:
 *         description: A list of seasons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   seasonId:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: Summer
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Oops, something went wrong!
 */
