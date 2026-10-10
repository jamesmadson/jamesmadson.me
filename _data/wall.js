// The wall: whatever images live in img/wall/ render on /wall/.
// Drop files in, rebuild, done. Page ships unlinked and noindexed;
// house rule before adding anyone else's work: references are linked,
// never rehosted.
const fs = require('fs');
const path = require('path');
module.exports = () => {
  const dir = path.join(__dirname, '..', 'img', 'wall');
  try {
    return fs.readdirSync(dir)
      .filter(f => /\.(png|jpe?g|webp|gif|avif)$/i.test(f))
      .sort()
      .map(f => '/img/wall/' + f);
  } catch (e) { return []; }
};
