/**
 * @swagger
 * /genders:
 *   get:
 *     summary: Get all genders
 *     description: Returns a list of all available genders.
 *     tags:
 *       - Genders
 *     responses:
 *       200:
 *         description: A list of genders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   genderId:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: Male
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
