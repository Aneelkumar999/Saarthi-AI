from sqlalchemy.orm import Session
from app.models import models
from app.core.database import SessionLocal, engine

def init_db():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if intents count is already 10
    if db.query(models.Intent).count() >= 10:
        db.close()
        return

    # Clear existing if needed or just add new
    # For a clean hackathon state, let's just make sure we have the core 10
    
    # Intents
    intents_data = [
        ('Tea Shop', 'Opening a new tea shop or small restaurant', ['tea shop', 'cafe', 'restaurant', 'canteen']),
        ('Birth Certificate', 'Applying for a new birth certificate', ['birth certificate', 'baby', 'newborn']),
        ('Farm Subsidy', 'Applying for government agricultural subsidies', ['farm', 'subsidy', 'agriculture', 'farmer']),
        ('Marriage Registration', 'Registering a marriage with the government', ['marriage', 'wedding', 'married']),
        ('Property Registration', 'Registering sale or purchase of property', ['property', 'land', 'house', 'registration']),
        ('MSME Registration', 'Registering a small or medium business (Udyam)', ['business', 'msme', 'udyam', 'company']),
        ('Caste Certificate', 'Applying for a community/caste certificate', ['caste', 'sc', 'st', 'bc', 'certificate']),
        ('Income Certificate', 'Applying for an official income certificate', ['income', 'salary', 'e-seva']),
        ('Driving License', 'Applying for a new learner or permanent driving license', ['driving', 'license', 'dl', 'rto']),
        ('Voter ID Update', 'Updating details or applying for a new Voter ID card', ['voter', 'election', 'voter id', 'vote'])
    ]

    intents = []
    for name, desc, keywords in intents_data:
        existing = db.query(models.Intent).filter(models.Intent.name == name).first()
        if not existing:
            intent = models.Intent(name=name, description=desc, trigger_keywords=keywords)
            db.add(intent)
            db.flush() # Get ID
            intents.append(intent)
        else:
            intents.append(existing)
    
    db.commit()

    # Services
    services_data = [
        ('Trade License', 'GHMC', 500.00, 15, 'License to trade within municipal limits'),
        ('FSSAI Registration', 'Health Dept', 100.00, 7, 'Food safety registration'),
        ('Shop & Establishment', 'Labour Dept', 200.00, 10, 'Registration under Shop & Establishment Act'),
        ('Birth Registration', 'Municipality', 0.00, 21, 'Registration of birth'),
        ('Marriage License', 'Revenue Dept', 1000.00, 30, 'Official registration of marriage'),
        ('Stamp Duty Payment', 'Sub-Registrar', 5000.00, 1, 'Payment of legal stamp duty for property'),
        ('Property Deed Registration', 'Sub-Registrar', 1000.00, 7, 'Formal registration of sale deed'),
        ('Udyam Registration', 'Ministry of MSME', 0.00, 1, 'Self-declaration based MSME registration'),
        ('Community Verification', 'MRO Office', 0.00, 15, 'Caste verification by local authorities'),
        ('Income Verification', 'MRO Office', 50.00, 7, 'Verification of annual household income'),
        ('Learner License Slot', 'RTO', 150.00, 3, 'Booking slot for learner license test'),
        ('Voter Form 8 Submission', 'Election Commission', 0.00, 30, 'Correction in voter details')
    ]

    services = {}
    for name, dept, fee, sla, desc in services_data:
        existing = db.query(models.Service).filter(models.Service.name == name).first()
        if not existing:
            service = models.Service(name=name, department=dept, fee=fee, sla_days=sla, description=desc)
            db.add(service)
            db.flush()
            services[name] = service
        else:
            services[name] = existing
    
    db.commit()

    # Map Intents to Services (Workflows)
    mappings = [
        ('Tea Shop', [('Shop & Establishment', 1), ('Trade License', 2), ('FSSAI Registration', 3)]),
        ('Birth Certificate', [('Birth Registration', 1)]),
        ('Marriage Registration', [('Marriage License', 1)]),
        ('Property Registration', [('Stamp Duty Payment', 1), ('Property Deed Registration', 2)]),
        ('MSME Registration', [('Udyam Registration', 1)]),
        ('Caste Certificate', [('Community Verification', 1)]),
        ('Income Certificate', [('Income Verification', 1)]),
        ('Driving License', [('Learner License Slot', 1)]),
        ('Voter ID Update', [('Voter Form 8 Submission', 1)])
    ]

    for intent_name, steps in mappings:
        intent = next(i for i in intents if i.name == intent_name)
        for s_name, order in steps:
            service = services[s_name]
            # Check if mapping already exists
            existing_map = db.query(models.IntentService).filter(
                models.IntentService.intent_id == intent.id,
                models.IntentService.service_id == service.id
            ).first()
            if not existing_map:
                db.add(models.IntentService(intent_id=intent.id, service_id=service.id, step_order=order))

    # Dependencies
    dep_data = [
        ('Trade License', 'Shop & Establishment'),
        ('Property Deed Registration', 'Stamp Duty Payment')
    ]

    for s1_name, s2_name in dep_data:
        s1 = services[s1_name]
        s2 = services[s2_name]
        existing_dep = db.query(models.ServiceDependency).filter(
            models.ServiceDependency.service_id == s1.id,
            models.ServiceDependency.requires_service_id == s2.id
        ).first()
        if not existing_dep:
            db.add(models.ServiceDependency(service_id=s1.id, requires_service_id=s2.id))
    
    db.commit()
    db.close()

if __name__ == "__main__":
    init_db()
