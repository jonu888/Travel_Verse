from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User

from rest_framework import serializers
import pandas as pd
import nltk
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import google.generativeai as genai
import requests
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from nltk.corpus import wordnet
import numpy as np
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Google Generative AI with your API key
genai.configure(api_key="AIzaSyAzHmYwTPqysWGPWjijhmx5PRMfRMHJkHQ")

# Initialize global variables for caching
TFIDF_VECTORIZER = None
TFIDF_MATRIX = None
PREPROCESSED_DESCRIPTIONS = None
DATAFRAME = None
LOCATION_CACHE = {}

# Initialize data on module load
def initialize_data():
    global TFIDF_VECTORIZER, TFIDF_MATRIX, PREPROCESSED_DESCRIPTIONS, DATAFRAME
    try:
        DATAFRAME = pd.read_csv(
            r"C:\Users\josan\OneDrive\Desktop\PRO\BackEnd\Travel\archive\Kerala_Tourist_Places.csv",
            encoding='ISO-8859-1',
            usecols=['City', 'Best Time to visit', 'About the city (long Description)']
        )
        DATAFRAME = DATAFRAME.dropna().drop_duplicates(subset=['City'])
        PREPROCESSED_DESCRIPTIONS = preprocess_descriptions(DATAFRAME['About the city (long Description)'])
        TFIDF_VECTORIZER = TfidfVectorizer(ngram_range=(1, 2), max_features=5000)
        TFIDF_MATRIX = TFIDF_VECTORIZER.fit_transform(PREPROCESSED_DESCRIPTIONS)
    except Exception as e:
        logger.error(f"Error initializing data: {str(e)}")

# Preprocess descriptions once
def preprocess_descriptions(descriptions):
    try:
        nltk.download('wordnet', quiet=True)
        nltk.download('punkt', quiet=True)
        nltk.download('stopwords', quiet=True)
        lemmatizer = WordNetLemmatizer()
        stop_words = set(stopwords.words('english'))

        # Convert to lowercase and remove special characters
        descrip = descriptions.str.replace('[^a-zA-Z\s]', ' ', regex=True).str.lower()

        # Tokenize, lemmatize, and remove stopwords
        descrip = descrip.apply(
            lambda text: ' '.join(
                lemmatizer.lemmatize(token)
                for token in nltk.word_tokenize(text)
                if token not in stop_words and len(token) > 2
            )
        )
        return descrip
    except Exception as e:
        logger.error(f"Error in preprocess_descriptions: {str(e)}")
        return descriptions

# Initialize data on module import
initialize_data()

# Query expansion using synonyms
def expand_query(user_input):
    try:
        synonyms = set()
        for token in nltk.word_tokenize(user_input.lower()):
            for syn in wordnet.synsets(token):
                for lemma in syn.lemmas():
                    synonyms.add(lemma.name().lower())
        return user_input + ' ' + ' '.join(synonyms)
    except Exception as e:
        logger.error(f"Error in query expansion: {str(e)}")
        return user_input

def gencon(place_name, user_input):
    try:
        default_description = f"Discover {place_name}, a fascinating destination with unique attractions and experiences."
        try:
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(
                f"Describe {place_name} as a tourist destination in 2-3 lines, considering these interests: {user_input}"
            )
            if response and hasattr(response, 'text'):
                return response.text
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            pass
        return default_description
    except Exception as e:
        logger.error(f"Error in gencon: {str(e)}")
        return f"Explore {place_name}, a remarkable destination waiting to be discovered."

def generate_google_maps_link(lat, lon):
    return f"https://www.google.com/maps?q={lat},{lon}"

def get_location_osm(place_name):
    if place_name in LOCATION_CACHE:
        return LOCATION_CACHE[place_name]

    url = f"https://nominatim.openstreetmap.org/search?q={place_name}&format=json"
    headers = {"User-Agent": "TourRecommendationSystem/1.0"}
    try:
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            return None
        data = response.json()
        if data:
            lat, lon = float(data[0]["lat"]), float(data[0]["lon"])
            LOCATION_CACHE[place_name] = (lat, lon)
            return (lat, lon)
        else:
            return None
    except Exception as e:
        logger.error(f"Error getting location: {str(e)}")
        return None

def nlp_chech(user_input):
    try:
        # Expand query with synonyms
        expanded_query = expand_query(user_input)
        
        # Preprocess user input
        nltk.download('wordnet', quiet=True)
        nltk.download('punkt', quiet=True)
        nltk.download('stopwords', quiet=True)
        lemmatizer = WordNetLemmatizer()
        stop_words = set(stopwords.words('english'))
        
        user_tokens = [
            lemmatizer.lemmatize(token.lower())
            for token in nltk.word_tokenize(expanded_query)
            if token.lower() not in stop_words and len(token) > 2
        ]
        user_query = ' '.join(user_tokens)
        
        # Transform user input using cached TF-IDF vectorizer
        user_input_tfidf = TFIDF_VECTORIZER.transform([user_query])
        user_similarity = cosine_similarity(user_input_tfidf, TFIDF_MATRIX)[0]
        
        # Keyword matching for strict filtering
        query_keywords = set(user_tokens)
        matched_indices = []
        for i, desc in enumerate(PREPROCESSED_DESCRIPTIONS):
            desc_tokens = set(desc.split())
            if query_keywords.intersection(desc_tokens):
                matched_indices.append((i, user_similarity[i]))
        
        # Sort by similarity score and apply strict threshold
        matched_indices.sort(key=lambda x: x[1], reverse=True)
        similarity_threshold = 0.1  # Stricter threshold
        recommended_indices = [
            idx for idx, score in matched_indices
            if score > similarity_threshold
        ]
        
        # If no results, take top 3 with keyword matches
        if not recommended_indices:
            recommended_indices = [idx for idx, _ in matched_indices[:3]]
            
        return recommended_indices
    except Exception as e:
        logger.error(f"Error in NLP processing: {str(e)}")
        return []

def search_kerala(user_input):
    try:
        place = {}
        recommended_indices = nlp_chech(user_input)
        
        for i in recommended_indices:
            place_details = dict(DATAFRAME.iloc[i][['City', 'Best Time to visit', 'About the city (long Description)']])
            location = get_location_osm(place_details['City'])
            map_link = generate_google_maps_link(*location) if location else ""
            
            place[place_details['City']] = [
                place_details['Best Time to visit'],
                place_details['About the city (long Description)'],
                map_link
            ]
        return place
    except Exception as e:
        logger.error(f"Error in India search: {str(e)}")
        return {}

@api_view(['GET'])
def test_api(request):
    return Response({
        'message': 'API is working!',
        'status': 'success'
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
def search_destinations(request):
    query = request.GET.get('query', '').strip()
    
    if not query:
        return Response({'error': 'No search query provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        results = search_kerala(query)
        
        return Response({
            'results': results
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in search_destinations: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)