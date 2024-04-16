import { S3 } from '@aws-sdk/client-s3';
import { sql } from '@vercel/postgres';
import slugify from 'slugify';
import xss from 'xss';

const s3 = new S3({
    region: 'eu-west-2'
  });

export async function getMeals(){
    try {
    const mealsData = await sql `SELECT * FROM meals WHERE id>0`;
    return mealsData.rows;
    } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch meals data.');
    }
}

export async function getMeal(slug){
    try {
    const mealData = await sql `SELECT * FROM meals WHERE slug = ${slug}`;
    return mealData.rows[0];
    } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch meal data.');
    }
}

export async function saveMeal(meal){
    meal.slug = slugify(meal.title, {lower: true});
    meal.instructions = xss(meal.instructions);

    const extension = meal.image.name.split('.').pop();
    const fileName = `${meal.slug}.${extension}`;

    const bufferedImage = await meal.image.arrayBuffer();

    s3.putObject({
        Bucket: 'simon-cranswick-next-demo',
        Key: fileName,
        Body: Buffer.from(bufferedImage),
        ContentType: meal.image.type,
      });

    meal.image = fileName;

    sql `
        INSERT INTO meals
            (title, summary, instructions, creator, creator_email, image, slug)
            VALUES (${meal.title}, ${meal.summary}, ${meal.instructions}, ${meal.creator}, ${meal.creator_email}, ${meal.image}, ${meal.slug})`;
}