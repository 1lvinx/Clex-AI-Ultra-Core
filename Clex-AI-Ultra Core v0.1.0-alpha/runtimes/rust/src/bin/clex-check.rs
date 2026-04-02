extern crate serde;
extern crate serde_json;

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Deserialize)]
struct Manifest {
    name: String,
    version: String,
    commands: Vec<Command>,
}

#[derive(Debug, Deserialize)]
struct Command {
    name: String,
    description: String,
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    
    if args.len() < 3 {
        eprintln!("Usage: clex-check <manifest|workflow|permission> <file>");
        std::process::exit(1);
    }
    
    let type_ = &args[1];
    let file = &args[2];
    
    match type_.as_str() {
        "manifest" => validate_manifest(file),
        "workflow" => validate_workflow(file),
        "permission" => validate_permission(file),
        _ => {
            eprintln!("Unknown type: {}", type_);
            std::process::exit(1);
        }
    }
}

fn validate_manifest(file: &str) {
    if !Path::new(file).exists() {
        eprintln!("File not found: {}", file);
        std::process::exit(1);
    }
    
    let content = fs::read_to_string(file).expect("Failed to read file");
    
    match serde_json::from_str::<Manifest>(&content) {
        Ok(manifest) => {
            println!("✅ Manifest valid: {}", manifest.name);
            println!("Version: {}", manifest.version);
            println!("Commands: {}", manifest.commands.len());
        }
        Err(e) => {
            eprintln!("❌ Invalid manifest: {}", e);
            std::process::exit(1);
        }
    }
}

fn validate_workflow(file: &str) {
    let content = fs::read_to_string(file).expect("Failed to read file");
    
    // Basic JSON validation
    match serde_json::from_value::<serde_json::Value>(serde_json::from_str(&content).unwrap()) {
        Ok(_) => println!("✅ Workflow valid"),
        Err(e) => {
            eprintln!("❌ Invalid workflow: {}", e);
            std::process::exit(1);
        }
    }
}

fn validate_permission(file: &str) {
    let content = fs::read_to_string(file).expect("Failed to read file");
    
    match serde_json::from_str::<serde_json::Value>(&content) {
        Ok(_) => println!("✅ Permission valid"),
        Err(e) => {
            eprintln!("❌ Invalid permission: {}", e);
            std::process::exit(1);
        }
    }
}
