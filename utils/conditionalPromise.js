/**
  * Check for a condition to be met within a certain time
  * @param {function} condition - The conditional function that has to return true
  * @param {number} maxWaitTime - The maximum time (ms) to wait before the promise is rejected
  * @return {Promise} A Promise for meeting said condition
  * @example
    let a = false;
    setTimeout(() => { a = true; }, 1000);
    try {
      await conditionalPromise(() => a === true, 3000);
      console.log('Condition has been met');
    } catch (err) {
      console.log(err);
    }
  */

const conditionalPromise = (condition, maxWaitTime = 5000) => {
  const callback = (resolve, reject) => {
    let rejected = false;

    const timeout = setTimeout(() => {
      rejected = true;
      reject(new Error('Condition wasn’t met in time.'));
    }, maxWaitTime);

    const wait = () => {
      if (!rejected) {
        if (condition()) {
          clearTimeout(timeout);
          resolve(true);
          return;
        }

        setTimeout(wait, 60);
      }
    };

    wait();
  };

  return new Promise(callback);
};

module.exports = conditionalPromise;
