const max_group_size = 4;
const orgs = [0,1,2,3];
const responses = [
    [0,1],
    [0,1],
    [0,1],
    [0,1],
    [0],
    [2],
    [2],
    [2],
    [2],
    [2],
    [2],
    [2],
    [2],
    [0,2],
    [0,2],
    [0,2],
    [0,2],
    [0,2],
    [0,2],
    [0,2],
    [0,2]
];

function assign(responses) {
  // assign ids to responses
  var responses = responses.map((prefs, id) => [id, prefs]);

  // assign people to org pools,
  // starting with those exclusively interested in an org
  var unassigned = [];
  var org_pools = orgs.map(() => []);
  responses.map(([id, prefs]) => {
    // exclusive interest,
    // just add to that org's pool
    if (prefs.length == 1) {
      org_pools[prefs[0]].push(id);
    } else {
      unassigned.push([id, prefs]);
    }
  });

  // count total interest for each org
  // so in instances of non-exclusive interest,
  // assignment priority is given to orgs with less overall interest
  var n_interested = orgs.map(org => {
    return responses.reduce((acc, [id, prefs]) => {
      return prefs.includes(org) ? acc + 1 : acc;
    }, 0);
  });

  // assign unassigned to org pools
  while (unassigned.length > 0) {
    // orgs which still have unassigned interest
    var unassigned_interest = [];
    unassigned.map(([id, prefs]) => {
      unassigned_interest = unassigned_interest.concat(prefs);
    });
    unassigned_interest = [...new Set(unassigned_interest)];

    // next org to assign to
    // is the one with the least assignees;
    // in the case of ties, choose a random one
    var next_org = unassigned_interest.reduce((min_org, org) => {
      return org_pools[min_org].length < org_pools[org].length ? min_org : org;
    }, unassigned_interest[0]);

    // prefer candidates for whom the alternative
    // is a highly interested org so as to prioritize
    // assignment to orgs with lower interest
    var candidates = [];
    unassigned.map(([id, prefs], i) => {
      if (prefs.includes(next_org)) {
        // candidates are scored by the interest of the most
        // popular org they prefer alternative to the
        // current one we are assigning for
        var other_prefs = prefs.filter(org => org != next_org);
        var other_prefs_interest = other_prefs.map(org => n_interested[org]);
        var score = Math.min(other_prefs_interest);
        candidates.push([i, score]);
      }
    });

    // get candidate with the most popular alternative org choice
    var i = candidates.reduce((max_candidate, candidate) => {
      return max_candidate[1] > candidate[1] ? max_candidate : candidate;
    }, candidates[0])[0];
    var id = unassigned.splice(i, 1)[0][0];
    org_pools[next_org].push(id);
  }

  // now assign the org pools into groups
  // prioritize evenly-sized groups over full-sized groups
  return org_pools.map((pool, i) => {
    var n_groups = Math.ceil(pool.length/max_group_size);
    var groups = [];
    for (var j=0; j<n_groups; j++) {
      groups.push([]);
    }
    pool.map((id, j) => {
      groups[j % n_groups].push(id);
    });
    return groups;
  });
}

console.log(JSON.stringify(assign(responses)));