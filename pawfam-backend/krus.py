import heapq
class UnionFind:



    def __init__(self, n):
        self.parent = [i for i in range(n + 1)]
        self.rank = [0] * (n + 1)

    def find(self, u):


        if self.parent[u] != u:

            
            self.parent[u] = self.find(self.parent[u])

        return self.parent[u]

    def union(self, u, v):

        root_u = self.find(u)
        root_v = self.find(v)

        if root_u == root_v:
  
            return False

        if self.rank[root_u] < self.rank[root_v]:
  
            self.parent[root_u] = root_v
        elif self.rank[root_u] > self.rank[root_v]:
  
            self.parent[root_v] = root_u
        else:
  
            self.parent[root_v] = root_u
  
            self.rank[root_u] += 1
  
        return True


def kruskal(edges, n):
    # initialize the variables
    total_weight = 0
    min_heap = []
    mst_edges = []
    uf = UnionFind(n)

    # sample input: list of tuples (u, v, weight) in adjacency list format
    dist = edges


    for (u, v, weight) in dist:


        heapq.heappush(min_heap, (weight, u, v))

    

    
    while min_heap and len(mst_edges) < n - 1:

        weight, u, v = heapq.heappop(min_heap)
        if uf.union(u, v):

            mst_edges.append((u, v, weight))
            total_weight += weight

    return mst_edges, total_weight


edges = [(1, 2, 1), (2, 3, 2), (2, 4, 4), (1, 4, 5), (1, 3, 3)]
n = 4

mst, cost = kruskal(edges, n)

for edge in mst:
    print(edge)

print("Total minimum cost:", cost)
