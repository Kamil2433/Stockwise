import os
import pandas as pd
import pickle
from sklearn.neighbors import NearestNeighbors

# Define the path for the returns_risks pickle file
returns_risks_path = os.path.join(os.path.dirname(__file__), 'models', 'returns_risks.pkl')
knn_model_path = os.path.join(os.path.dirname(__file__), 'models', 'knn_model.pkl')

# Load the returns_risks data
with open(returns_risks_path, 'rb') as f:
    returns_risks = pickle.load(f)

# Prepare the data for KNN
returns_risks_df = pd.DataFrame.from_dict(returns_risks, orient='index')
X = returns_risks_df[['average_return', 'risk']].values

# Fit the KNN model
knn = NearestNeighbors(n_neighbors=6)
knn.fit(X)

# Save the KNN model to a pickle file
with open(knn_model_path, 'wb') as f:
    pickle.dump(knn, f)

print("KNN model saved successfully.")