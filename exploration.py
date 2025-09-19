# exploration.py
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import pickle

# -------------------------
# 1️⃣ Column mapping
# -------------------------
column_mapping = {
    "Index": None,  # not needed
    "UsingIP": "having_IP_Address",
    "LongURL": "URL_Length",
    "ShortURL": "Shortining_Service",
    "Symbol@": "having_At_Symbol",
    "Redirecting//": "double_slash_redirecting",
    "PrefixSuffix-": "Prefix_Suffix",
    "SubDomains": "having_Sub_Domain",
    "HTTPS": "SSLfinal_State",
    "DomainRegLen": "Domain_registeration_length",
    "Favicon": "Favicon",
    "NonStdPort": "port",
    "HTTPSDomainURL": "HTTPS_token",
    "RequestURL": "Request_URL",
    "AnchorURL": "URL_of_Anchor",
    "LinksInScriptTags": "Links_in_tags",
    "ServerFormHandler": "SFH",
    "InfoEmail": "Submitting_to_email",
    "AbnormalURL": "Abnormal_URL",
    "WebsiteForwarding": "Redirect",
    "StatusBarCust": "on_mouseover",
    "DisableRightClick": "RightClick",
    "UsingPopupWindow": "popUpWidnow",
    "IframeRedirection": "Iframe",
    "AgeofDomain": "age_of_domain",
    "DNSRecording": "DNSRecord",
    "WebsiteTraffic": "web_traffic",
    "PageRank": "Page_Rank",
    "GoogleIndex": "Google_Index",
    "LinksPointingToPage": "Links_pointing_to_page",
    "StatsReport": "Statistical_report",
    "class": "Result"
}

# -------------------------
# 2️⃣ Load & merge datasets
# -------------------------
def load_and_merge_datasets():
    df_kaggle = pd.read_csv("dataset/phishing_kaggle.csv")
    df_uci = pd.read_csv("dataset/phishing_uci.csv")

    df_kaggle = df_kaggle.drop(columns=["Index"], errors="ignore")
    df_kaggle = df_kaggle.rename(columns=column_mapping)
    df_kaggle = df_kaggle[df_uci.columns]  # same order

    df_combined = pd.concat([df_uci, df_kaggle], ignore_index=True)
    df_combined.to_csv("dataset/phishing_combined.csv", index=False)
    print("Unified dataset saved as phishing_combined.csv")
    return df_combined

# -------------------------
# 3️⃣ Clean dataset
# -------------------------
def clean_dataset(df):
    def clean_value(x):
        if isinstance(x, bytes):
            return int(x.decode())
        if isinstance(x, str) and x.startswith("b'"):
            return int(x.strip("b'"))
        return int(x)

    df = df.applymap(clean_value)
    df = df.drop_duplicates()
    df.to_csv("dataset/phishing_combined.csv", index=False)
    print("Cleaned dataset saved ✅")
    return df

# -------------------------
# 4️⃣ Exploratory analysis
# -------------------------
def explore_dataset(df):
    print("Shape:", df.shape)
    print("\nColumns:", df.columns.tolist())
    print("\nData types:\n", df.dtypes)
    print("\nFirst 5 rows:\n", df.head())
    print("\nMissing values:\n", df.isnull().sum())
    print("\nDuplicate rows:", df.duplicated().sum())
    print("\nTarget distribution:\n", df['Result'].value_counts())

    # Visualize class balance
    sns.countplot(x='Result', data=df)
    plt.title("Phishing vs Legitimate Websites")
    plt.xticks(ticks=[0,1], labels=['Legitimate (-1)', 'Phishing (1)'])
    plt.show()

    print("\nFeature statistics:\n", df.describe())

# -------------------------
# 5️⃣ Train Random Forest & save
# -------------------------
def train_random_forest(df):
    X = df.drop(columns=['Result'])
    y = df['Result']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    score = f1_score(y_test, y_pred, pos_label=1)
    print(f"\n✅ Random Forest trained with F1-score = {round(score,4)}")

    # Save model
    with open("phishing_model.pkl", "wb") as f:
        pickle.dump(model, f)
    print("✅ Random Forest saved as phishing_model.pkl")

# -------------------------
# 6️⃣ Evaluate saved model
# -------------------------
def evaluate_saved_model(df, model_path="phishing_model.pkl"):
    X = df.drop(columns=['Result'])
    y = df['Result']

    # Same train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Load saved Random Forest
    with open(model_path, "rb") as f:
        model = pickle.load(f)

    # Predict & evaluate
    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, pos_label=1)
    recall = recall_score(y_test, y_pred, pos_label=1)
    f1 = f1_score(y_test, y_pred, pos_label=1)
    cm = confusion_matrix(y_test, y_pred)

    print("✅ Saved Model Evaluation Metrics:")
    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1-Score:  {f1:.4f}")
    print("\nConfusion Matrix:\n", cm)

    # Confusion matrix plot
    plt.figure(figsize=(5,4))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=['Legitimate (-1)', 'Phishing (1)'],
                yticklabels=['Legitimate (-1)', 'Phishing (1)'])
    plt.title("Confusion Matrix for Saved Model")
    plt.ylabel('Actual')
    plt.xlabel('Predicted')
    plt.show()


# -------------------------
# Main workflow
# -------------------------
if __name__ == "__main__":
    df_combined = load_and_merge_datasets()
    df_cleaned = clean_dataset(df_combined)
    explore_dataset(df_cleaned)
    train_random_forest(df_cleaned)
    evaluate_saved_model(df_cleaned)

