const { createError, json, send } = require('micro');
const SanityClient = require('@sanity/client');

const client = SanityClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET_NAME,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

module.exports = async (req, res) => {
  const { ids } = await json(req);
  console.log('got ids:', ids);
  if (!ids) throw createError(400, 'Bad Request');
  const { /* updated, deleted, */ created } = ids;
  const { documentIds } = await created
    .reduce(
      (trans, _id) =>
        trans.patch(_id, p => p.setIfMissing({ title: 'Missing TITLE!!!' })),
      client.transaction()
    )
    .commit()
    .catch(error => {
      console.error(error);
      throw createError(400, 'Bad Request');
    });
  if (documentIds) {
    console.log('updated: ', documentIds.join('\n\t'));
  }
  send(res, 200, 'ok');
};

/* const docs = await created
    .reduce(
      (trans, _id) =>
        trans.patch(_id).setIfMissing({
          title: 'Missing TITLE!!!',
        }),
      client.transaction()
    )
    .commit()
    .catch(console.error);
  console.log(docs);
  };
  */
