import { S3 } from '@aws-sdk/client-s3';
import { sql } from '@vercel/postgres';
import slugify from 'slugify';
import xss from 'xss';

const s3 = new S3({
    region: 'eu-west-2'
  });
const db = sql('meals.db');

export function getMeals(){
    return sql `SELECT * FROM meals`;
}

export function getMeal(slug){
    return sql `SELECT * FROM meals where slug = ?`.get(slug);
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
        VALUES (
            @title,
            @summary,
            @instructions,
            @creator,
            @creator_email,
            @image,
            @slug
        )
    `.run(meal);
}