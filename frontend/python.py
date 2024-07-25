from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, CallbackContext
from pymongo import MongoClient
from urllib.parse import urlparse, parse_qs
import logging

# Enable logging
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                    level=logging.INFO)

# MongoDB connection string
mongo_uri = ""
client = MongoClient(mongo_uri)
db = client.get_database()
users_collection = db.users  # Assume you have a 'users' collection

# Function to handle '/start' command
def start(update: Update, context: CallbackContext) -> None:
    """Send a message when the command /start is issued."""
    logging.info(f"User {update.effective_user.username} issued /start command")
    message = "Welcome to the referral bot! Use a referral link to earn points."
    update.message.reply_text(message)

# Function to handle referral link joining
def handle_referral_link(update: Update, context: CallbackContext) -> None:
    """Handle referral links from users."""
    referral_link = update.message.text
    logging.info(f"Received referral link: {referral_link}")
    
    parsed_url = urlparse(referral_link)
    query_params = parse_qs(parsed_url.query)

    if 'start' in query_params:
        # Extract user_id from the 'start' parameter
        user_id = query_params['start'][0].lstrip('r')  # Remove 'r' prefix if present

        # Check if user exists in the database
        user = users_collection.find_one({'userId': user_id})

        if user:
            # User exists, add 100 points
            current_points = user.get('points', 0)
            new_points = current_points + 100
            users_collection.update_one({'userId': user_id}, {'$set': {'points': new_points}})
            update.message.reply_text(f"Added 100 points to user {user_id}. Current points: {new_points}")
            logging.info(f"Added 100 points to user {user_id}. Current points: {new_points}")
        else:
            # User does not exist, create new user with 100 points
            new_user = {'userId': user_id, 'points': 100, 'referrerId': update.effective_user.id}
            users_collection.insert_one(new_user)
            update.message.reply_text(f"New user {user_id} created with 100 points.")
            logging.info(f"New user {user_id} created with 100 points.")

            # Update the referrer's points and referred count
            referrer = users_collection.find_one({'userId': str(update.effective_user.id)})
            if referrer:
                referrer_points = referrer.get('points', 0)
                referrer_points += 10  # Adjust the referral bonus amount as needed
                referrer_referred = referrer.get('referred', 0)
                referrer_referred += 1
                users_collection.update_one({'userId': str(update.effective_user.id)}, {'$set': {'points': referrer_points, 'referred': referrer_referred}})
                update.message.reply_text(f"Your referrer {update.effective_user.id} received a bonus of 10 points.")

        # Generate the referral link in the desired format
        referral_link = f"https://t.me/NameOfTheBot?start=r{user_id}"
        keyboard = [[InlineKeyboardButton("Referral Link", url=referral_link)]]
        reply_markup = InlineKeyboardMarkup(keyboard)
        update.message.reply_text("Here's your referral link:", reply_markup=reply_markup)

    elif referral_link.startswith('/start'):
        # Send a welcome message with the web app link
        update.message.reply_text(f"Welcome! Visit our web app: https://3e88-103-153-175-140.ngrok-free.app/")
        logging.info("Sent welcome message with web app link.")
    
    else:
        update.message.reply_text("Invalid referral link format.")
        logging.warning("Invalid referral link format.")

def main() -> None:
    # Create the Updater and pass it your bot's token
    updater = Updater("7387882407:AAFUh9_E5-aq-xzpn1n_Z2eGm1EpO9s0caw", use_context=True)

    # Get the dispatcher to register handlers
    dispatcher = updater.dispatcher

    # Log all errors
    dispatcher.add_error_handler(error_callback)

    # on different commands - answer in Telegram
    dispatcher.add_handler(CommandHandler("start", start))

    # on non command i.e message - echo the message on Telegram
    dispatcher.add_handler(MessageHandler(Filters.text & ~Filters.command, handle_referral_link))

    # Start the Bot
    updater.start_polling()

    # Run the bot until you press Ctrl-C
    updater.idle()

def error_callback(update: Update, context: CallbackContext) -> None:
    """Log all errors from Telegram updates."""
    logging.error(f'Error "{context.error}" occurred with update {update}')

if __name__ == '__main__':
    main()