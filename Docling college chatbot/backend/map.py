import osmnx as ox
import networkx as nx
import folium

locations = {
    "Main Gate": (11.081525363696516, 77.13429285090719),
    "KPR CAS": (11.080666701222475, 77.13510691029911),
    "KPR Staff quarters": (11.079634129087113, 77.13406026250948),
    "Students parking": (11.077249560831607, 77.14036539730463),
    "KPR Food court": (11.077662411714652, 77.1409831179411),
    "KPRIET": (11.076444761187608, 77.14202685275929),
    "Admin block": (11.07671651195898, 77.14208542971336),
    "Library": (11.075885580921987, 77.14204815346986),
    "KPR 1st Year Block": (11.07587593587222, 77.14172262310579),
    "Boys restroom": (11.07605501789596, 77.14221895710789),
    "KPR MECH,EEE,Civil": (11.076346065726293, 77.14314073561296),
    "OAT": (11.076823934184398, 77.14280809380497),
    "CSE block": (11.076833766860366, 77.14319884773649),
    "ECE Block": (11.077097076784973, 77.1427746835377),
    "BME , CSBS,IT Block": (11.07742427775825, 77.14318701059605),
    "AIML , Chemical Block": (11.077659534804738, 77.1428353844472),
    "KPR kalaiarangam": (11.077782286005291, 77.14208349652485),
    "Gym": (11.078404471311574, 77.14131656211012),
    "KPR Boys mess": (11.07917049333202, 77.14272431282589),
    "KPR boys hostel": (11.07872894376592, 77.1424925282044),
    "KPR playground": (11.081042125480804, 77.1418096797646)
}

center_point = (11.076444761187608, 77.14202685275929)
G = ox.graph_from_point(center_point, dist=1500, network_type='walk', simplify=True)
G = G.to_undirected()

# Get nearest nodes
def get_nearest_node(point):
    lat, lon = point
    return ox.distance.nearest_nodes(G, lon, lat)

start_name = "Main Gate"
end_name = "CSE block"

# These are your original lat-lon points
start_node = get_nearest_node(locations[start_name])
end_node = get_nearest_node(locations[end_name])

# Get shortest route using actual walkable roads
route = nx.shortest_path(G, start_node, end_node, weight='length')

# Route coordinates (from graph)
route_coords = [(G.nodes[node]['y'], G.nodes[node]['x']) for node in route]

# Use node coords for markers too (to avoid indoor locations)
start_coords = (G.nodes[start_node]['y'], G.nodes[start_node]['x'])
end_coords = (G.nodes[end_node]['y'], G.nodes[end_node]['x'])

# Create map centered at midpoint
avg_lat = (start_coords[0] + end_coords[0]) / 2
avg_lon = (start_coords[1] + end_coords[1]) / 2
campus_map = folium.Map(location=[avg_lat, avg_lon], zoom_start=17)

folium.Marker(location=start_coords, popup=start_name, icon=folium.Icon(color='green')).add_to(campus_map)
folium.Marker(location=end_coords, popup=end_name, icon=folium.Icon(color='red')).add_to(campus_map)

folium.PolyLine(route_coords, color="blue", weight=5, opacity=0.7).add_to(campus_map)

campus_map.save("kpriet_route_map.html")
print("Map with road-following route saved as 'kpriet_campus_map.html'.")
