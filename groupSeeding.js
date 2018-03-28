// based on number of teams, find best number of groups
// randomly put teams from list into different groups
// based on the smallest group size, determine the number of matches each team will play
// create game match ups between teams in each group

fs = require('fs');
const pathToTeamList = './teamList.txt'; // each teams should be on it's own line

function getTeamListFromTextFile(pathToTeamList) {
  return new Promise((fulfill, reject) => {
    fs.readFile(pathToTeamList, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        reject();
      }
      fulfill(data.split(/\r?\n/));
    });
  });
}

// this list is of team objects
function createGroups(teamList) {
  let numberOfGroups;

  if (teamList.length < 20) {
    // 1-4 groups with min group size === 5
    numberOfGroups = Math.floor(teamList.length / 5);
  } else if (teamList.length <= 1000) {
    // 4 groups spread em out
    numberOfGroups = 4;
  }

  console.log('numberOfGroups: ' + numberOfGroups);
  let currentGroupAssignment = 1;
  const groups = [];

  for(let i = 0; i < numberOfGroups; i++) {
    groups.push({
      id: i,
      teams: []
    });
  }

  teamList.forEach(teamName => {

  });


}



getTeamListFromTextFile(pathToTeamList).then(teamList => {
  createGroups(teamList);
});
