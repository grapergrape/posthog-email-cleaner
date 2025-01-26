def process_event(event):
    email = (event.get("properties", {})
                  .get("$set", {})
                  .get("email") or
             event.get("properties", {})
                  .get("$set_once", {})
                  .get("email"))

    if not email:
        return event  # Return early if there's no email

    free_email_providers = [
        "gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "aol.com",
        "icloud.com", "mail.com", "zoho.com", "protonmail.com", "gmx.com",
        "yandex.com", "mail.ru", "live.com", "msn.com", "inbox.com", 
        "fastmail.com"
    ]

    email_domain = email.split('@')[1]
    is_free_email = email_domain in free_email_providers

    # Calculate fake email probability
    local_part = email.split('@')[0]
    length_factor = len(local_part) / 100 if len(local_part) >= 18 else 0

    digits = [char for char in local_part if char.isdigit()]
    distinct_digits = len(set(digits))
    excess_distinct_digits = max(0, distinct_digits - 4)
    digit_factor = (2 ** excess_distinct_digits) * 0.1 if excess_distinct_digits > 0 else 0

    fake_probability = min(1, length_factor + digit_factor)

    event["properties"]["$set_once"] = {
        **event["properties"].get("$set_once", {}),
        "is_free_email": is_free_email,
        "is_real_probability": 1 - fake_probability
    }

    return event

def main():
    event = {
        "event": "JAP/user/desk_reservation_no_checkin",
        "uuid": "018e10a1-751e-0000-1869-f4ed5bf53cb4",
        "properties": {
            "reservation_id": "e4a7d368-4e64-4a64-8803-77158907f5f7",
            "resource_id": "96dc3de6-9ac1-4902-ae1d-cffcecf61661",
            "$set": {
                "$geoip_city_name": "Brussels",
                "$geoip_subdivision_2_name": None,
                "$geoip_subdivision_2_code": None,
                "$geoip_subdivision_1_name": "Brussels Capital",
                "$geoip_subdivision_1_code": "BRU",
                "$geoip_country_name": "Belgium",
                "$geoip_country_code": "BE",
                "$geoip_continent_name": "Europe",
                "$geoip_continent_code": "EU",
                "$geoip_postal_code": "1000",
                "$geoip_latitude": 50.8534,
                "$geoip_longitude": 4.347,
                "$geoip_time_zone": "Europe/Brussels",
                "email": "Stanislav.Skrypnik@magentus.com",
                "company_id": "e1bf98a4-da58-491f-b5b7-0590674b2f26",
                "company_name": "Magentus",
                "company_domain": "citadelgroup.com.au"
            },
            "$lib": "posthog-python",
            "$lib_version": "2.3.1",
            "$ip": "34.77.229.140",
            "$set_once": {
                "$initial_geoip_city_name": "Brussels",
                "$initial_geoip_subdivision_2_name": None,
                "$initial_geoip_subdivision_2_code": None,
                "$initial_geoip_subdivision_1_name": "Brussels Capital",
                "$initial_geoip_subdivision_1_code": "BRU",
                "$initial_geoip_country_name": "Belgium",
                "$initial_geoip_country_code": "BE",
                "$initial_geoip_continent_name": "Europe",
                "$initial_geoip_continent_code": "EU",
                "$initial_geoip_postal_code": "1000",
                "$initial_geoip_latitude": 50.8534,
                "$initial_geoip_longitude": 4.347,
                "$initial_geoip_time_zone": "Europe/Brussels"
            },
            "$geoip_city_name": "Brussels",
            "$geoip_country_name": "Belgium",
            "$geoip_country_code": "BE",
            "$geoip_continent_name": "Europe",
            "$geoip_continent_code": "EU",
            "$geoip_postal_code": "1000",
            "$geoip_latitude": 50.8534,
            "$geoip_longitude": 4.347,
            "$geoip_time_zone": "Europe/Brussels",
            "$geoip_subdivision_1_code": "BRU",
            "$geoip_subdivision_1_name": "Brussels Capital",
            "$plugins_succeeded": [
                "GeoIP (3061)",
                "URL parameters to event properties (3063)"
            ],
            "$plugins_failed": [
                "UTM Referrer (3062)"
            ],
            "$plugins_deferred": []
        }
    }

    processed_event = process_event(event)
    print(processed_event.get("properties", {}).get("$set_once", {}).get("is_free_email"))
    print(processed_event.get("properties", {}).get("$set_once", {}).get("is_real_probability"))

if __name__ == "__main__":
    main()
