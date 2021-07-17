// Read https://buildingrecommenders.wordpress.com/2015/11/18/overview-of-recommender-algorithms-part-2/
// Watch https://www.youtube.com/watch?v=h9gpufJFF-0
// Read https://datascience.stackexchange.com/questions/2598/item-based-and-user-based-recommendation-difference-in-mahout

const math = require('mathjs');
const common = require('./common')

function predictWithCfUserBased(ratingsGroupedByUser, ratingsGroupedByMovie, userId) {
   

  const { userItem } = getMatrices(ratingsGroupedByUser, ratingsGroupedByMovie, userId);
  const { matrix, movieIds, userIndex } = userItem; 
  console.log('mztrix:', movieIds)
  
  //console.log('mztrix:', matrix)
  const matrixNormalized = meanNormalizeByRowVector(matrix);
  //console.log('matrixNormalized:', matrixNormalized)
  const userRatingsRowVector = matrixNormalized[userIndex];
  console.log('userRatingsRowVector:', userRatingsRowVector)

  const cosineSimilarityRowVector = common.getCosineSimilarityRowVector(matrixNormalized, userIndex);
  console.log('cosineSimilarityRowVector:', cosineSimilarityRowVector)

const predictedRatings = userRatingsRowVector.map((rating, movieIndex) => {
    const productId = movieIds[movieIndex];

    const movieRatingsRowVector = getMovieRatingsRowVector(matrixNormalized, movieIndex);
    console.log('movieRatingsRowVector', movieIndex)
    const test = getMovieRatingsRowVector(matrix, movieIndex)
    
    let score;
    if (rating === 0) {
      score = getPredictedRating(
        test,
        movieRatingsRowVector, 
        cosineSimilarityRowVector
        );
    } else {
      score = rating
    }

    return { score, productId };
  });
  console.log('pred: ', predictedRatings)
  return common.sortByScore(predictedRatings);
}

function predictWithCfUserBasedItem(ratingsGroupedByUser, ratingsGroupedByMovie, userId, movId) {
   

  const { userItem } = getMatrices(ratingsGroupedByUser, ratingsGroupedByMovie, userId);
  const { matrix, movieIds, userIndex } = userItem; 
  //console.log('mztrix:', matrix)
  
  const matrixNormalized = meanNormalizeByRowVector(matrix);
  //console.log('matrixNormalized:', matrixNormalized)
  const userRatingsRowVector = matrixNormalized[userIndex];
  //console.log('userRatingsRowVector:', userRatingsRowVector)
  const vmean = getMean(matrix[userId]);
  const cosineSimilarityRowVector = common.getCosineSimilarityRowVector(matrixNormalized, userIndex);
  //console.log('cosineSimilarityRowVector:', cosineSimilarityRowVector)

  const predictedRatings = userRatingsRowVector.map((rating, movieIndex) => {
    const productId = movieIds[movieIndex];

    const movieRatingsRowVector = getMovieRatingsRowVector(matrixNormalized, movieIndex);
    const test = getMovieRatingsRowVector(matrix, movieIndex)
    
    let score;
    if (rating === 0) {
      score = getPredictedRating(
        test,
        movieRatingsRowVector, 
        cosineSimilarityRowVector
        );
    } else {
      score = rating
    }

    return { score, productId };
  });

return predictedRatings.map(i => {
  return {score:i.score += vmean, productId: i.productId};
});
}

function predictWithCfItemBased(ratingsGroupedByUser, ratingsGroupedByMovie, userId) {
  const { itemUser } = getMatrices(ratingsGroupedByUser, ratingsGroupedByMovie, userId);
  const { matrix, movieIds, userIndex } = itemUser;
  //console.log('matri item', getUserRatingsRowVector(matrix, userIndex))
  const oriRatingMatrix = getUserRatingsRowVector(matrix, userIndex);
  //console.log(test)
  const matrixNormalized = meanNormalizeByRowVector(matrix);
  //console.log('matrixNormalized item-item:', matrixNormalized)
  const userRatingsRowVector = getUserRatingsRowVector(matrixNormalized, userIndex);

  const predictedRatings = userRatingsRowVector.map((rating, movieIndex) => {
  const productId = movieIds[movieIndex];
  const cosineSimilarityRowVector = common.getCosineSimilarityRowVector(matrixNormalized, movieIndex);

  let score;
  if (rating === 0) {
    score = getPredictedRating(
      oriRatingMatrix, 
      userRatingsRowVector,
      cosineSimilarityRowVector
    );
    
    //prevent with similary vector full zeros
    if (isNaN(score)) score = 0;
  } else {
    score = rating;
  }

  return { score, productId };
  });

  var listpredictedRatings = [];
  for(let i = 0; i<predictedRatings.length; i++) {
    if (oriRatingMatrix[i] === -1)
    listpredictedRatings.push(predictedRatings[i])
  }
  return common.sortByScore(listpredictedRatings);
}

function predictWithCfItemBasedItem(ratingsGroupedByUser, ratingsGroupedByMovie, userId, moId) {
  const { itemUser } = getMatrices(ratingsGroupedByUser, ratingsGroupedByMovie, userId);
  const { matrix, movieIds, userIndex } = itemUser;
  const vmean = getMean(matrix[userId]);
  const test = getUserRatingsRowVector(matrix, userIndex);
  const matrixNormalized = meanNormalizeByRowVector(matrix);
  //console.log('matrixNormalized item-item:', matrixNormalized)
  const userRatingsRowVector = getUserRatingsRowVector(matrixNormalized, userIndex);

  const predictedRatings = userRatingsRowVector.map((rating, movieIndex) => {
  const productId = movieIds[movieIndex];

  const cosineSimilarityRowVector = common.getCosineSimilarityRowVector(matrixNormalized, movieIndex);

  let score;
  if (rating === 0) {
    score = getPredictedRating(
      test, 
      userRatingsRowVector,
      cosineSimilarityRowVector
    );
  } else {
    score = rating;
  }

  return { score, productId };
  });
  
  return predictedRatings.map(i => {
    return {score: i.score += vmean, productId: i.productId};
  });
}

function getPredictedRating(ratingsRowVectorOrigin, ratingsRowVector, cosineSimilarityRowVector) {
  const N = 2;
  //console.log(cosineSimilarityRowVector)
  const neighborSelection = cosineSimilarityRowVector
    // keep track of rating and similarity
    .map((similarity, index) => ({ similarity, rating: ratingsRowVector[index], ratingOri: ratingsRowVectorOrigin[index] }))
    // only neighbors with a rating
    .filter(value => value.ratingOri != -1)
    // most similar neighbors on top
    .sort((a, b) => b.similarity - a.similarity)
    // N neighbors
    .slice(0, N);
  //console.log('neighborSelection:', neighborSelection)

  const numerator = neighborSelection.reduce((result, value) => { 
    return result + value.similarity * value.rating;
  }, 0);

  const denominator = neighborSelection.reduce((result, value) => {
    return result + math.abs(value.similarity);
  }, 0);

  //console.log('num: ', numerator, 'den:', denominator)
  return numerator / denominator;
}

function getUserRatingsRowVector(itemBasedMatrix, userIndex) {
  return itemBasedMatrix.map(itemRatings => {
    return itemRatings[userIndex];
  });
}

function getMovieRatingsRowVector(userBasedMatrix, movieIndex) {
  return userBasedMatrix.map(userRatings => {
    return userRatings[movieIndex];
  });
}

function meanNormalizeByRowVector(matrix) {
  return matrix.map((rowVector) => {
    return rowVector.map(cell => {
      return cell !== -1 ? Number(Math.round(cell - getMean(rowVector)+'e2')+'e-2') : 0;
    });
  });
}

function getMean(rowVector) {
  const valuesWithoutZeroes = rowVector.filter(cell => cell !== -1);
  //console.log('test:', valuesWithoutZeroes.length ? math.mean(valuesWithoutZeroes) : 0)
  return valuesWithoutZeroes.length ? Number(Math.round(math.mean(valuesWithoutZeroes)+'e2')+'e-2') : 0;
}

function getMatrices(ratingsGroupedByUser, ratingsGroupedByMovie, uId) {
  const itemUser = Object.keys(ratingsGroupedByMovie).reduce((result, productId) => {
    const rowVector = Object.keys(ratingsGroupedByUser).map((userId, userIndex) => {

      if (userId == uId) {
        result.userIndex = userIndex;
      }

      return getConditionalRating(ratingsGroupedByMovie, productId, userId);
    });

    result.matrix.push(rowVector);
    result.movieIds.push(productId);

    return result;
  }, { matrix: [], movieIds: [], userIndex: null });

  const userItem = Object.keys(ratingsGroupedByUser).reduce((result, userId, userIndex) => {
    const rowVector = Object.keys(ratingsGroupedByMovie).map(productId => {
      return getConditionalRating(ratingsGroupedByUser, userId, productId);
    });

    result.matrix.push(rowVector);

    if (userId == uId) {
      result.userIndex = userIndex;
    }

    return result;
  }, { matrix: [], movieIds: Object.keys(ratingsGroupedByMovie), userIndex: null });

  return { itemUser, userItem };
}

function getConditionalRating(value, primaryKey, secondaryKey) {
  if (!value[primaryKey]) {
    return -1;
  }

  if (!value[primaryKey][secondaryKey]) {
    return -1;
  }

  return value[primaryKey][secondaryKey].rating;
}

module.exports = {
  predictWithCfItemBased,
}