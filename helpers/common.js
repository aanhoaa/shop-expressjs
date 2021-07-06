const similarity = require('compute-cosine-similarity') ;

function sortByScore(recommendation) {
  return recommendation.sort((a, b) => b.score - a.score);
}

function sortBySimilar(recommendation) {
  return recommendation.sort((a, b) => b.similarity - a.similarity);
}

function getVal(recommendation, movId, vmean) {
  return recommendation.find(element => Number(element.movieId) === Number(movId)).score + vmean;
}



// X x 1 row vector based on similarities of movies
// 1 equals similar, -1 equals not similar, 0 equals orthogonal
// Whole matrix is too computational expensive for 45.000 movies
// https://en.wikipedia.org/wiki/Cosine_similarity
function getCosineSimilarityRowVector(matrix, index) {
  return matrix.map((rowRelative, i) => {
    return Number(Math.round(similarity(matrix[index], matrix[i])+'e2')+'e-2');
  });
}

function getMovieIndexByTitle(MOVIES_IN_LIST, query) {
  const index = MOVIES_IN_LIST.map(movie => movie.title).indexOf(query);

  if (!index) {
    throw new Error('Movie not found');
  }

  const { title, id } = MOVIES_IN_LIST[index];
  return { index, title, id };
}

module.exports = {
  sortByScore,
  getCosineSimilarityRowVector
}