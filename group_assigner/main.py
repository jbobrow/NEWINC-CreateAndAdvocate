import math
max_group_size = 4
orgs = list(range(3))
responses = [
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
]

# assign ids to responses
responses = [(id, prefs) for id, prefs in enumerate(responses)]

# assign people to org pools,
# starting with those exclusively interested in a org
unassigned = []
org_pools = [[] for org in orgs]
for id, prefs in responses:
    # exclusive interest,
    # just add to that org's pool
    if len(prefs) == 1:
        org_pools[prefs[0]].append(id)
    else:
        unassigned.append((id, prefs))

# count total interest for each org
# so in instances of non-exclusive interest,
# assignment priority is given to orgs with less overall interest
n_interested = [sum(1 if org in prefs else 0 for _, prefs in responses) for org in orgs]

while unassigned:
    # orgs which still have unassigned interest
    unassigned_interest = []
    for _, prefs in unassigned:
        unassigned_interest.extend(prefs)
    unassigned_interest = set(unassigned_interest)

    # next org to assign to
    # is the one with the least assignees;
    # in case of ties, choose a random one
    next_org = min(unassigned_interest, key=lambda org: len(org_pools[org]))

    # prefer candidates for whom the alternative
    # is a highly interested org so as to prioritize
    # assignment to orgs with lower interest
    candidates = []
    for i, (id, prefs) in enumerate(unassigned):
        if next_org not in prefs:
            continue

        # candidates are scored by the interest of the most
        # popular org they prefer alternative to the
        # current one we assigning for
        other_prefs = [org for org in prefs if org != next_org]
        score = min(n_interested[org] for org in other_prefs)
        candidates.append((i, score))

    # get candidate with the most popular alternative org choice
    i = max(candidates, key=lambda c: c[1])[0]
    id = unassigned.pop(i)[0]
    org_pools[next_org].append(id)

# now assign the org pools into groups
# prioritize evenly-sized groups over full-sized groups
for i, pool in enumerate(org_pools):
    n_groups = int(math.ceil(len(pool)/float(max_group_size)))
    groups = [[] for _ in range(n_groups)]
    for j, id in enumerate(pool):
        groups[j % n_groups].append(id)
    print(i, groups)