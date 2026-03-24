from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

# ------------------------------
# Account Setup
# ------------------------------
class Account:
    def __init__(self, name, acc_no, balance, pin):
        self.name = name
        self.acc_no = acc_no
        self.balance = balance
        self.pin = pin
        self.statement = []

# Sample accounts
accounts = {
    "1000": Account("Demo Account holder ", "1000", 1000000, "@1234"),
    "1001": Account("Prabhkirat Singh", "1001", 50000, "4321"),
    "1002": Account("K Monish", "1002", 30000, "2345"),
    "1003": Account("Abinav GT", "1003", 20000, "3456")
}

# ATM config
atm_cash = 100000
atm_limit = 20000

# Currency notes
CURRENCY_NOTES = {
    'INR': [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1],
    'USD': [100, 50, 20, 10, 5, 1],
    'EUR': [500, 200, 100, 50, 20, 10, 5, 2, 1],
    'GBP': [50, 20, 10, 5, 2, 1],
    'SAR': [500, 100, 50, 10, 5, 1]
}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/user/<acc_no>')
def get_user(acc_no):
    acc = accounts.get(acc_no)
    if acc:
        return jsonify({
            "name": acc.name,
            "acc_no": acc.acc_no,
            "balance": acc.balance
        })
    return jsonify({})

@app.route('/account-details', methods=['POST'])
def account_details():
    data = request.get_json()
    acc = accounts.get(data.get('acc_no'))
    pin = data.get('pin')

    if not acc or acc.pin != pin:
        return jsonify({"status": "error", "message": "Incorrect PIN"})

    return jsonify({
        "status": "success",
        "balance": acc.balance
    })

@app.route('/mini-statement', methods=['POST'])
def mini_statement():
    data = request.get_json()
    acc = accounts.get(data.get('acc_no'))
    pin = data.get('pin')

    if not acc or acc.pin != pin:
        return jsonify({"status": "error", "message": "Invalid PIN"})

    return jsonify({
        "status": "success",
        "transactions": acc.statement
    })

@app.route('/change-pin', methods=['POST'])
def change_pin():
    data = request.get_json()
    acc = accounts.get(data.get('acc_no'))
    old_pin = data.get('old_pin')
    new_pin = data.get('new_pin')

    if not acc or acc.pin != old_pin:
        return jsonify({"status": "error", "message": "Incorrect current PIN"})

    acc.pin = new_pin
    return jsonify({"status": "success", "message": "PIN updated successfully"})

@app.route('/withdraw', methods=['POST'])
def withdraw():
    global atm_cash
    data = request.get_json()

    acc_no = data.get('acc_no')
    pin = str(data.get('pin'))
    currency = data.get('currency', 'INR')
    amount = int(data.get('amount'))

    acc = accounts.get(acc_no)

    if not acc:
        return jsonify({"status": "error", "message": "Account not found"})

    if pin != acc.pin:
        return jsonify({"status": "error", "message": "Incorrect PIN"})

    if amount <= 0:
        return jsonify({"status": "error", "message": "Enter a valid amount"})

    if acc.balance < amount:
        return jsonify({"status": "error", "message": "Insufficient account balance"})

    if currency == 'INR':
        if amount > atm_cash:
            return jsonify({"status": "error", "message": f"ATM has only ₹{atm_cash} left"})
        if amount > atm_limit:
            return jsonify({"status": "error", "message": f"ATM limit is ₹{atm_limit} per transaction"})

    notes_list = CURRENCY_NOTES.get(currency)
    if not notes_list:
        return jsonify({"status": "error", "message": f"Unsupported currency: {currency}"})

    remaining = amount
    notes = {}

    for note in notes_list:
        if remaining >= note:
            count = remaining // note
            notes[note] = count
            remaining -= note * count

    if remaining == 0:
        acc.balance -= amount
        if currency == 'INR':
            atm_cash -= amount

        acc.statement.append({
        "type": f"Withdrawal ({currency})",
        "amount": amount,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })


        return jsonify({
            "status": "success",
            "message": f"Successfully withdrew {currency} {amount}",
            "notes": notes,
            "balance": acc.balance
        })

    else:
        return jsonify({"status": "error", "message": "Unable to break amount into available denominations"})
        
@app.route('/health')
def health():
    return "OK", 200

if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
