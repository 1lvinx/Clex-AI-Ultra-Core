"""Example: Validate a command."""
from clex_core import CommandValidator


def main():
    """Validate command example."""
    print("=== Clex Python Runtime - Command Validation Example ===\n")
    
    validator = CommandValidator()
    
    commands = [
        "ls -la",
        "cat file.txt",
        "rm -rf /tmp",
        "git status",
    ]
    
    for command in commands:
        print(f"Command: {command}")
        result = validator.validate(command)
        
        print(f"  Level: {result['level']}")
        print(f"  Score: {result['score']}")
        print(f"  Needs Approval: {result['needs_approval']}")
        print(f"  Advice: {result['advice']}")
        print()


if __name__ == "__main__":
    main()
