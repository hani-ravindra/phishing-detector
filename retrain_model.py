import pandas as pd
import joblib
from xgboost import XGBClassifier
from urllib.parse import urlparse
import re
import os

print("--- Starting Model Retraining Script ---")

# --- 1. Define All 12 Feature Extraction Functions ---
# We must duplicate these from the notebook so this script can run independently
def get_url_length(url):
    return len(str(url))
def get_hostname_length(url):
    try: return len(urlparse(url).netloc)
    except: return 0
def get_dot_count(url):
    return str(url).count('.')
def get_slash_count(url):
    return str(url).count('/')
def has_ip_address(url):
    try:
        if re.search(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', urlparse(url).netloc): return 1
        return 0
    except: return 0
def has_special_chars(url):
    if re.search(r'[@_-]', str(url)): return 1
    return 0
def get_subdomain_count(url):
    try:
        hostname = urlparse(url).netloc
        return len(hostname.split('.')) - 2
    except: return 0
def has_https(url):
    try:
        if urlparse(url).scheme == 'https': return 1
        return 0
    except: return 0
def has_sensitive_keywords(url):
    keywords = ['login', 'secure', 'account', 'verify', 'password', 'signin', 'banking']
    for keyword in keywords:
        if keyword in str(url).lower():
            return 1
    return 0
def count_directories(url):
    try:
        path = urlparse(url).path
        return len([segment for segment in path.split('/') if segment])
    except: return 0
def count_query_params(url):
    try:
        query = urlparse(url).query
        if not query: return 0
        return len(query.split('&'))
    except: return 0
def is_shortened(url):
    shorteners = ['bit.ly', 't.co', 'goo.gl', 'tinyurl', 'ow.ly']
    try:
        hostname = urlparse(url).netloc
        for shortener in shorteners:
            if shortener in str(hostname): return 1
        return 0
    except: return 0

# --- 2. Load New Feedback Data ---
feedback_file = 'reported_urls.csv'
if not os.path.exists(feedback_file):
    print("No new feedback found. Exiting.")
    exit()

print(f"Loading new feedback from '{feedback_file}'...")
feedback_df = pd.read_csv(feedback_file)

# Drop any rows with missing URLs
feedback_df.dropna(subset=['URL'], inplace=True)

# --- 3. Process Feedback Data (Feature Engineering) ---
print("Processing new URLs and engineering features...")
features_list = {
    'url_length': get_url_length, 'hostname_length': get_hostname_length,
    'dot_count': get_dot_count, 'slash_count': get_slash_count,
    'has_ip': has_ip_address, 'has_special_chars': has_special_chars,
    'subdomain_count': get_subdomain_count, 'has_https': has_https,
    'has_sensitive_words': has_sensitive_keywords, 'directory_count': count_directories,
    'query_param_count': count_query_params, 'is_shortened': is_shortened
}

for feature_name, func in features_list.items():
    feedback_df[feature_name] = feedback_df['URL'].apply(func)

# Standardize the label column
feedback_df['Label'] = feedback_df['Reported_As'].map({'phishing': 1, 'legitimate': 0})
# Select only the columns we need
feature_cols = list(features_list.keys())
processed_feedback_df = feedback_df[feature_cols + ['Label']]

# --- 4. Load Original Training Data ---
original_data_file = 'processed_features.csv'
print(f"Loading original training data from '{original_data_file}'...")
original_df = pd.read_csv(original_data_file)

# --- 5. Combine Datasets ---
print("Combining original data with new feedback data...")
combined_df = pd.concat([original_df, processed_feedback_df], ignore_index=True)
# Remove any duplicates, keeping the most recent (feedback) one
combined_df.drop_duplicates(subset=feature_cols, keep='last', inplace=True)

print(f"New combined dataset has {len(combined_df)} total samples.")

# --- 6. Re-Train the Model ---
print("Re-training the model on the new, combined dataset...")
X = combined_df[feature_cols]
y = combined_df['Label']

# We use the best parameters we found during our tuning
best_params = {'n_estimators': 100, 'max_depth': 10, 'learning_rate': 0.1, 'colsample_bytree': 0.8}

model = XGBClassifier(
    use_label_encoder=False, 
    eval_metric='logloss', 
    random_state=42, 
    **best_params
)

model.fit(X, y)

# --- 7. Save the New Model ---
model_filename = 'phishing_detector_model.joblib'
joblib.dump(model, model_filename)
print(f"✅ Successfully re-trained and saved new model to '{model_filename}'!")

# --- 8. Clear the Feedback File ---
# This is crucial so we don't re-use the same feedback next time
os.remove(feedback_file)
print(f"Cleared '{feedback_file}' for next feedback cycle.")
