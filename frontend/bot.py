import os
from datetime import datetime
from pymongo import MongoClient
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
import asyncio
import hashlib
import hmac
import json
import urllib.parse
import logging

# Enable logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.DEBUG
)
logger = logging.getLogger(__name__)

# Configuration
TOKEN = ''
MONGO_URI = ""
WEB_APP_BASE_URL = 'https://app.likhon.xyz/'
POINTS_PER_REFERRAL = 100

# MongoDB setup
client = MongoClient(MONGO_URI)
db = client.taskapp
users_collection = db.users

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    try:
        user = update.effective_user
        chat_id = update.effective_chat.id
        user_id = user.id
        username = user.username or "Anonymous"

        # Check if user was referred
        if context.args and context.args[0]:
            referral_code = context.args[0]
            referrer = users_collection.find_one({"referral_code": referral_code})
            if referrer and str(referrer['user_id']) != str(user_id):
                users_collection.update_one(
                    {"user_id": referrer['user_id']},
                    {
                        "$addToSet": {"referrals": user_id},
                        "$inc": {"points": POINTS_PER_REFERRAL}
                    }
                )

        # Create or update user
        user_data = users_collection.find_one_and_update(
            {"user_id": user_id},
            {
                "$setOnInsert": {
                    "username": username,
                    "points": 0,
                    "completed_tasks": [],
                    "referral_code": str(user_id),
                    "referrals": [],
                    "join_date": datetime.now()
                },
                "$set": {"last_active": datetime.now()}
            },
            upsert=True,
            return_document=True
        )

        web_app_url = generate_web_app_url(user)
        referral_link = f"https://t.me/InfinityWeb3CryptoBot?start={user_data['referral_code']}"
        short_referral_link = await generate_short_link(referral_link)

        message = (
            f"🚀 Welcome to Infinity Web3 Crypto Bot, {username}!\n"
            f"🌟 Dive into the world of crypto and earn rewards as you learn and explore.\n\n"
            f"📊 Points: {user_data['points']}\n"
            f"💰 Earn {POINTS_PER_REFERRAL} points for each referral you make!\n"
            f"✨ Start your crypto journey now and maximize your earnings through various activities."
        )

        keyboard = [
            [InlineKeyboardButton("🌐 Open Web App", web_app=WebAppInfo(url=generate_web_app_url(user)))],
            [InlineKeyboardButton("🔗 My Referral Link", callback_data="referral_link")],
            [InlineKeyboardButton("📊 My Stats", callback_data="my_stats")],
            [InlineKeyboardButton("ℹ️ How to Earn", callback_data="how_to_earn")],
            [InlineKeyboardButton("🎯 Daily Task", callback_data="daily_task")],
            [InlineKeyboardButton("🌍 Visit Our Website", url="https://infbsc.xyz/")],
            [InlineKeyboardButton("📢 Join Our Telegram", url="https://t.me/Inf_bsc")],
            [InlineKeyboardButton("👨‍💻 Visit Our GitHub", url="https://github.com/infbsc")],
            [InlineKeyboardButton("🐦 Follow Us on Twitter", url="https://twitter.com/Inf_bsc")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_text(message, reply_markup=reply_markup)
        await context.bot.set_chat_menu_button(chat_id=chat_id, menu_button={"type": "web_app", "text": "Open Web App", "web_app": {"url": web_app_url}})
    except Exception as e:
        logger.error(f"Error in start handler: {e}")

async def button_click(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    try:
        query = update.callback_query
        await query.answer()

        if query.data == "referral_link":
            await handle_referral_link(update, context)
        elif query.data == "my_stats":
            await handle_my_stats(update, context)
        elif query.data == "how_to_earn":
            await handle_how_to_earn(update, context)
        elif query.data == "daily_task":
            await handle_daily_task(update, context)
        elif query.data == "copy_link":
            await handle_copy_link(update, context)
        elif query.data == "referral_stats":
            await handle_referral_stats(update, context)
    except Exception as e:
        logger.error(f"Error in button_click handler: {e}")

async def handle_referral_link(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    try:
        user_id = update.effective_user.id
        user_data = users_collection.find_one({"user_id": user_id})

        if user_data:
            referral_link = f"https://t.me/InfinityWeb3CryptoBot?start={user_data['referral_code']}"
            short_referral_link = await generate_short_link(referral_link)
            message = (
                f"🎉 Here's your unique referral link:\n\n{short_referral_link}\n\n"
                f"📢 Share this link with your friends. When they join using your link, you'll earn {POINTS_PER_REFERRAL} points!\n\n"
                f"👥 Total Referrals: {len(user_data.get('referrals', []))}\n"
                f"💰 Points Earned from Referrals: {len(user_data.get('referrals', [])) * POINTS_PER_REFERRAL}"
            )
            keyboard = [
                [InlineKeyboardButton("📋 Copy Link", callback_data="copy_link")],
                [InlineKeyboardButton("📊 Referral Stats", callback_data="referral_stats")]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            await update.callback_query.message.edit_text(message, reply_markup=reply_markup)
        else:
            await update.callback_query.message.edit_text("Sorry, we couldn't find your user information. Please try starting the bot again with /start.")
    except Exception as e:
        logger.error(f"Error in handle_referral_link: {e}")

async def handle_my_stats(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    try:
        user_id = update.effective_user.id
        user_data = users_collection.find_one({"user_id": user_id})

        if user_data:
            message = (
                f"📊 Your Stats:\n\n"
                f"💰 Total Points: {user_data['points']}\n"
                f"👥 Total Referrals: {len(user_data.get('referrals', []))}\n"
                f"✅ Completed Tasks: {len(user_data.get('completed_tasks', []))}\n"
                f"🗓 Join Date: {user_data['join_date'].strftime('%Y-%m-%d')}"
            )
            await update.callback_query.message.edit_text(message)
        else:
            await update.callback_query.message.edit_text("Sorry, we couldn't find your user information. Please try starting the bot again with /start.")
    except Exception as e:
        logger.error(f"Error in handle_my_stats: {e}")

async def handle_how_to_earn(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    try:
        message = (
            "ℹ️ How to Earn Points:\n\n"
            f"1. Refer Friends: Earn {POINTS_PER_REFERRAL} points for each friend who joins using your referral link.\n"
            "2. Complete Daily Tasks: Check the 🎯 Daily Task button for opportunities to earn points.\n"
            "3. Participate in Campaigns: Keep an eye out for special campaigns and events where you can earn bonus points.\n"
            "4. Engage with the Community: Active participation in our community can lead to additional earning opportunities.\n\n"
            "Remember, the more you engage, the more you earn! 🚀"
        )
        await update.callback_query.message.edit_text(message)
    except Exception as e:
        logger.error(f"Error in handle_how_to_earn: {e}")

async def handle_daily_task(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    try:
        # Implement daily task logic here
        message = (
            "🎯 Daily Task:\n\n"
            "Today's task is not yet available. Please check back later for your daily earning opportunity!"
        )
        await update.callback_query.message.edit_text(message)
    except Exception as e:
        logger.error(f"Error in handle_daily_task: {e}")

async def handle_copy_link(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    try:
        user_id = update.effective_user.id
        user_data = users_collection.find_one({"user_id": user_id})

        if user_data:
            referral_link = f"https://t.me/InfinityWeb3CryptoBot?start={user_data['referral_code']}"
            short_referral_link = await generate_short_link(referral_link)
            message = f"Here's your referral link:\n\n{short_referral_link}\n\nIt has been copied to your clipboard."
            await update.callback_query.answer("Link copied to clipboard!")
            await update.callback_query.message.reply_text(message)
        else:
            await update.callback_query.answer("An error occurred. Please try again.")
    except Exception as e:
        logger.error(f"Error in handle_copy_link: {e}")

async def handle_referral_stats(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    try:
        user_id = update.effective_user.id
        user_data = users_collection.find_one({"user_id": user_id})

        if user_data:
            total_referrals = len(user_data.get('referrals', []))
            points_earned = total_referrals * POINTS_PER_REFERRAL
            message = (
                f"📊 Your Referral Stats:\n\n"
                f"👥 Total Referrals: {total_referrals}\n"
                f"💰 Points Earned: {points_earned}\n\n"
                f"🏆 Keep sharing to earn more!"
            )
            await update.callback_query.message.edit_text(message)
        else:
            await update.callback_query.answer("An error occurred. Please try again.")
    except Exception as e:
        logger.error(f"Error in handle_referral_stats: {e}")

def generate_web_app_url(user):
    try:
        user_data = {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name or "",
            "username": user.username,
            "language_code": user.language_code,
            "is_premium": user.is_premium if hasattr(user, 'is_premium') else False,
            "allows_write_to_pm": True
        }
        chat_instance = str(int(datetime.now().timestamp() * 1000))
        auth_date = int(datetime.now().timestamp())
        data_check_string = "\n".join([f"{k}={v}" for k, v in sorted(user_data.items())])
        secret_key = hmac.new(TOKEN.encode(), b"WebAppData", hashlib.sha256).digest()
        hash_string = f"auth_date={auth_date}\nchat_instance={chat_instance}\nuser={data_check_string}"
        hash_value = hmac.new(secret_key, hash_string.encode(), hashlib.sha256).hexdigest()
        
        tg_web_app_data = {
            "user": user_data,
            "chat_instance": chat_instance,
            "auth_date": auth_date,
            "hash": hash_value
        }
        encoded_data = urllib.parse.quote(json.dumps(tg_web_app_data))
        return f"{WEB_APP_BASE_URL}#tgWebAppData={encoded_data}"
    except Exception as e:
        logger.error(f"Error in generate_web_app_url: {e}")

async def generate_short_link(long_url):
    try:
        # Implement URL shortening logic here
        # For now, we'll return the original URL
        return long_url
    except Exception as e:
        logger.error(f"Error in generate_short_link: {e}")
        return long_url

def main() -> None:
    try:
        application = Application.builder().token(TOKEN).build()

        application.add_handler(CommandHandler("start", start))
        application.add_handler(CallbackQueryHandler(button_click))

        application.run_polling(allowed_updates=Update.ALL_TYPES)
    except Exception as e:
        logger.error(f"Error in main function: {e}")

if __name__ == '__main__':
    main()
