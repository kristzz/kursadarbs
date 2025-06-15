<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Business;
use App\Models\ProfileSection;
use App\Models\Post;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a regular user with full profile
        $regularUser = User::create([
            'name' => 'Test User',
            'email' => 'test@test.lv',
            'password' => Hash::make('testtest'),
            'country' => 'Latvia',
            'profession' => 'Full Stack Developer',
            'role' => 'user',
            'source' => 'seeded',
        ]);

        // Create profile sections for the regular user
        ProfileSection::create([
            'user_id' => $regularUser->id,
            'section_type' => ProfileSection::SECTION_TYPE_WORK,
            'description' => 'Senior Full Stack Developer at Tech Solutions Ltd. Responsible for developing and maintaining web applications using Laravel, React, and Vue.js. Led a team of 5 developers on multiple projects.',
            'start_date' => '2022-01-15',
            'end_date' => null,
            'institution' => 'Tech Solutions Ltd',
            'is_public' => true,
        ]);

        ProfileSection::create([
            'user_id' => $regularUser->id,
            'section_type' => ProfileSection::SECTION_TYPE_WORK,
            'description' => 'Junior Web Developer at StartupCorp. Worked on frontend development using React and TypeScript. Gained experience in agile development methodologies.',
            'start_date' => '2020-06-01',
            'end_date' => '2021-12-31',
            'institution' => 'StartupCorp',
            'is_public' => true,
        ]);

        ProfileSection::create([
            'user_id' => $regularUser->id,
            'section_type' => ProfileSection::SECTION_TYPE_EDUCATION,
            'description' => 'Bachelor of Computer Science with focus on Software Engineering. Graduated with honors. Thesis on "Modern Web Development Frameworks".',
            'start_date' => '2017-09-01',
            'end_date' => '2021-06-30',
            'institution' => 'University of Latvia',
            'is_public' => true,
        ]);

        ProfileSection::create([
            'user_id' => $regularUser->id,
            'section_type' => ProfileSection::SECTION_TYPE_CERTIFICATION,
            'description' => 'AWS Certified Developer - Associate. Certification in cloud computing and serverless architecture.',
            'start_date' => '2023-03-15',
            'end_date' => '2026-03-15',
            'institution' => 'Amazon Web Services',
            'is_public' => true,
        ]);

        ProfileSection::create([
            'user_id' => $regularUser->id,
            'section_type' => ProfileSection::SECTION_TYPE_PROJECT,
            'description' => 'E-commerce Platform - Built a full-stack e-commerce solution using Laravel API and React frontend. Implemented payment processing, inventory management, and admin dashboard.',
            'start_date' => '2023-01-01',
            'end_date' => '2023-06-30',
            'institution' => 'Personal Project',
            'is_public' => true,
        ]);

        ProfileSection::create([
            'user_id' => $regularUser->id,
            'section_type' => ProfileSection::SECTION_TYPE_SKILL,
            'description' => 'PHP, Laravel, JavaScript, TypeScript, React, Vue.js, Node.js, MySQL, PostgreSQL, MongoDB, Docker, AWS, Git',
            'start_date' => null,
            'end_date' => null,
            'institution' => null,
            'is_public' => true,
        ]);

        ProfileSection::create([
            'user_id' => $regularUser->id,
            'section_type' => ProfileSection::SECTION_TYPE_LANGUAGE,
            'description' => 'Latvian (Native), English (Fluent), Russian (Conversational)',
            'start_date' => null,
            'end_date' => null,
            'institution' => null,
            'is_public' => true,
        ]);

        // Create an employer user with full profile
        $employerUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin@admin.lv',
            'password' => Hash::make('testtest'),
            'country' => 'Latvia',
            'profession' => 'CEO & Founder',
            'role' => 'employer',
            'source' => 'seeded',
        ]);

        // Create business profile for the employer
        $business = Business::create([
            'user_id' => $employerUser->id,
            'name' => 'InnovateTech Solutions',
            'industry' => 'Information Technology',
            'website' => 'https://innovatetech.lv',
            'logo' => null,
            'description' => 'Leading technology company in Latvia specializing in custom software development, web applications, and digital transformation services. We help businesses leverage technology to achieve their goals and stay competitive in the digital age.',
            'country' => 'Latvia',
            'location' => 'Riga, Latvia',
        ]);

        // Create 20 job listings for the employer
        $jobListings = [
            [
                'title' => 'Senior Full Stack Developer',
                'jobDesc' => 'We are looking for an experienced Full Stack Developer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern technologies including Laravel, React, and Vue.js. The ideal candidate should have strong problem-solving skills and experience with both frontend and backend development.',
                'profession' => 'Full Stack Developer',
                'location' => 'Riga, Latvia',
                'salaryRangeLowest' => 2500.00,
                'salaryRangeHighest' => 3500.00,
            ],
            [
                'title' => 'Frontend Developer (React/Vue.js)',
                'jobDesc' => 'Join our frontend team to create beautiful and responsive user interfaces. We need a skilled developer proficient in React and Vue.js who can translate designs into pixel-perfect, interactive web applications. Experience with TypeScript and modern CSS frameworks is highly valued.',
                'profession' => 'Frontend Developer',
                'location' => 'Riga, Latvia',
                'salaryRangeLowest' => 2000.00,
                'salaryRangeHighest' => 2800.00,
            ],
            [
                'title' => 'Backend Developer (Laravel/PHP)',
                'jobDesc' => 'We are seeking a Backend Developer with expertise in Laravel and PHP to build robust APIs and server-side applications. You will work on database design, API development, and integration with third-party services. Knowledge of MySQL, Redis, and cloud platforms is a plus.',
                'profession' => 'Backend Developer',
                'location' => 'Riga, Latvia',
                'salaryRangeLowest' => 2200.00,
                'salaryRangeHighest' => 3000.00,
            ],
            [
                'title' => 'DevOps Engineer',
                'jobDesc' => 'Looking for a DevOps Engineer to manage our cloud infrastructure and deployment pipelines. Experience with AWS, Docker, Kubernetes, and CI/CD tools is essential. You will be responsible for ensuring scalability, security, and reliability of our systems.',
                'profession' => 'DevOps Engineer',
                'location' => 'Riga, Latvia',
                'salaryRangeLowest' => 2800.00,
                'salaryRangeHighest' => 3800.00,
            ],
            [
                'title' => 'UI/UX Designer',
                'jobDesc' => 'Creative UI/UX Designer needed to design intuitive and engaging user experiences. You will work closely with our development team to create wireframes, prototypes, and high-fidelity designs. Proficiency in Figma, Adobe Creative Suite, and understanding of user-centered design principles required.',
                'profession' => 'UI/UX Designer',
                'location' => 'Riga, Latvia',
                'salaryRangeLowest' => 1800.00,
                'salaryRangeHighest' => 2500.00,
            ],
            [
                'title' => 'Project Manager (IT)',
                'jobDesc' => 'Experienced Project Manager wanted to lead software development projects from conception to delivery. You will coordinate with cross-functional teams, manage timelines, and ensure project success. PMP certification and experience with Agile methodologies preferred.',
                'profession' => 'Project Manager',
                'location' => 'Riga, Latvia',
                'salaryRangeLowest' => 2300.00,
                'salaryRangeHighest' => 3200.00,
            ],
            [
                'title' => 'QA Engineer',
                'jobDesc' => 'Quality Assurance Engineer needed to ensure the quality of our software products. You will design and execute test plans, perform manual and automated testing, and work closely with development teams to identify and resolve issues. Experience with testing frameworks and tools required.',
                'profession' => 'QA Engineer',
                'location' => 'Riga, Latvia',
                'salaryRangeLowest' => 1900.00,
                'salaryRangeHighest' => 2600.00,
            ],
            [
                'title' => 'Mobile App Developer (Flutter)',
                'jobDesc' => 'Flutter Developer wanted to build cross-platform mobile applications. You will develop iOS and Android apps using Flutter framework, integrate with APIs, and ensure optimal performance. Experience with Dart, Firebase, and mobile app deployment processes required.',
                'profession' => 'Mobile Developer',
                'location' => 'Riga, Latvia',
                'salaryRangeLowest' => 2100.00,
                'salaryRangeHighest' => 2900.00,
            ],
            [
                'title' => 'Data Analyst',
                'jobDesc' => 'Data Analyst position available to analyze business data and provide insights. You will work with large datasets, create reports and visualizations, and help drive data-driven decisions. Proficiency in SQL, Python, and BI tools like Tableau or Power BI required.',
                'profession' => 'Data Analyst',
                'location' => 'Riga, Latvia',
                'salaryRangeLowest' => 2000.00,
                'salaryRangeHighest' => 2700.00,
            ],
            [
                'title' => 'System Administrator',
                'jobDesc' => 'System Administrator needed to maintain and optimize our IT infrastructure. Responsibilities include server management, network configuration, security implementation, and user support. Experience with Linux, Windows Server, and networking protocols essential.',
                'profession' => 'System Administrator',
                'location' => 'Riga, Latvia',
                'salaryRangeLowest' => 1800.00,
                'salaryRangeHighest' => 2400.00,
            ],
            [
                'title' => 'Junior Web Developer',
                'jobDesc' => 'Entry-level Web Developer position perfect for recent graduates or career changers. You will learn modern web development technologies, work on real projects, and receive mentorship from senior developers. Basic knowledge of HTML, CSS, JavaScript, and willingness to learn required.',
                'profession' => 'Junior Developer',
                'location' => 'Riga, Latvia',
                'salaryRangeLowest' => 1200.00,
                'salaryRangeHighest' => 1800.00,
            ],
            [
                'title' => 'Cybersecurity Specialist',
                'jobDesc' => 'Cybersecurity Specialist wanted to protect our digital assets and infrastructure. You will implement security measures, conduct vulnerability assessments, and respond to security incidents. Experience with security frameworks, penetration testing, and incident response required.',
                'profession' => 'Cybersecurity Specialist',
                'location' => 'Riga, Latvia',
                'salaryRangeLowest' => 2600.00,
                'salaryRangeHighest' => 3500.00,
            ],
            [
                'title' => 'Business Analyst',
                'jobDesc' => 'Business Analyst role to bridge the gap between business needs and technical solutions. You will gather requirements, analyze business processes, and work with stakeholders to define project scope. Strong analytical skills and experience with business process modeling required.',
                'profession' => 'Business Analyst',
                'location' => 'Riga, Latvia',
                'salaryRangeLowest' => 2100.00,
                'salaryRangeHighest' => 2800.00,
            ],
            [
                'title' => 'Database Administrator',
                'jobDesc' => 'Database Administrator position to manage and optimize our database systems. You will ensure data integrity, perform backups, monitor performance, and implement security measures. Experience with MySQL, PostgreSQL, and database optimization techniques required.',
                'profession' => 'Database Administrator',
                'location' => 'Riga, Latvia',
                'salaryRangeLowest' => 2200.00,
                'salaryRangeHighest' => 3000.00,
            ],
            [
                'title' => 'Technical Writer',
                'jobDesc' => 'Technical Writer needed to create clear and comprehensive documentation for our software products. You will write user manuals, API documentation, and technical guides. Excellent writing skills and ability to explain complex technical concepts simply required.',
                'profession' => 'Technical Writer',
                'location' => 'Riga, Latvia',
                'salaryRangeLowest' => 1600.00,
                'salaryRangeHighest' => 2200.00,
            ],
            [
                'title' => 'Software Architect',
                'jobDesc' => 'Senior Software Architect position to design and oversee the architecture of complex software systems. You will make high-level design choices, define technical standards, and guide development teams. Extensive experience with system design and multiple programming languages required.',
                'profession' => 'Software Architect',
                'location' => 'Riga, Latvia',
                'salaryRangeLowest' => 3500.00,
                'salaryRangeHighest' => 4500.00,
            ],
            [
                'title' => 'Machine Learning Engineer',
                'jobDesc' => 'Machine Learning Engineer wanted to develop and deploy ML models. You will work on data preprocessing, model training, and production deployment. Experience with Python, TensorFlow/PyTorch, and cloud ML services required. PhD in related field preferred.',
                'profession' => 'ML Engineer',
                'location' => 'Riga, Latvia',
                'salaryRangeLowest' => 3000.00,
                'salaryRangeHighest' => 4000.00,
            ],
            [
                'title' => 'Cloud Solutions Architect',
                'jobDesc' => 'Cloud Solutions Architect to design and implement cloud-based solutions. You will work with AWS, Azure, or GCP to architect scalable and secure cloud infrastructures. Cloud certifications and experience with microservices architecture highly valued.',
                'profession' => 'Cloud Architect',
                'location' => 'Riga, Latvia',
                'salaryRangeLowest' => 3200.00,
                'salaryRangeHighest' => 4200.00,
            ],
            [
                'title' => 'Product Owner',
                'jobDesc' => 'Product Owner role to define product vision and manage product backlog. You will work closely with stakeholders, prioritize features, and ensure product success. Experience with Agile methodologies and product management tools required.',
                'profession' => 'Product Owner',
                'location' => 'Riga, Latvia',
                'salaryRangeLowest' => 2400.00,
                'salaryRangeHighest' => 3300.00,
            ],
            [
                'title' => 'Sales Manager (IT Solutions)',
                'jobDesc' => 'Sales Manager position to drive sales of our IT solutions and services. You will identify new business opportunities, build client relationships, and achieve sales targets. Experience in B2B sales and understanding of IT solutions required.',
                'profession' => 'Sales Manager',
                'location' => 'Riga, Latvia',
                'salaryRangeLowest' => 2000.00,
                'salaryRangeHighest' => 3000.00,
            ],
        ];

        foreach ($jobListings as $job) {
            Post::create([
                'user_id' => $employerUser->id,
                'business_id' => $business->id,
                'title' => $job['title'],
                'jobDesc' => $job['jobDesc'],
                'profession' => $job['profession'],
                'country' => 'Latvia',
                'location' => $job['location'],
                'salaryRangeLowest' => $job['salaryRangeLowest'],
                'salaryRangeHighest' => $job['salaryRangeHighest'],
            ]);
        }
    }
}
