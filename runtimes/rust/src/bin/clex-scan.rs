extern crate serde;
extern crate serde_json;

use std::fs;
use std::path::Path;

fn main() {
    let skills_dir = std::env::args().nth(1).unwrap_or_else(|| "../skills".to_string());
    
    if !Path::new(&skills_dir).exists() {
        eprintln!("Directory not found: {}", skills_dir);
        std::process::exit(1);
    }
    
    println!("Scanning skills in: {}", skills_dir);
    
    let entries = fs::read_dir(&skills_dir).expect("Failed to read directory");
    
    let mut count = 0;
    for entry in entries {
        let entry = entry.expect("Failed to read entry");
        let path = entry.path();
        
        if path.is_dir() {
            let skill_name = path.file_name().unwrap().to_string_lossy();
            let skill_md = path.join("SKILL.md");
            
            if skill_md.exists() {
                println!("  ✅ {}", skill_name);
            } else {
                println!("  ⚠️  {} (SKILL.md missing)", skill_name);
            }
            count += 1;
        }
    }
    
    println!("\nTotal: {} skills scanned", count);
}
