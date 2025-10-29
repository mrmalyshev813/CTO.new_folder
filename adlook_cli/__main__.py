"""Main entrypoint for AdLook CLI."""

import sys
from pathlib import Path

from .cli import parse_args
from .config import Config
from .utils import setup_logging, get_logger, create_timestamped_dir, RuntimeStats


def main() -> int:
    """
    Main entrypoint for the CLI.
    
    Returns:
        Exit code (0 for success, non-zero for failure)
    """
    args = parse_args()
    
    setup_logging(verbose=args.verbose)
    logger = get_logger(__name__)
    
    logger.info(f"AdLook CLI - Analyzing {args.url}")
    
    try:
        require_api_key = not args.dry_run
        config = Config.from_env(require_api_key=require_api_key)
        
        logger.debug(f"Configuration loaded: timeout={config.timeout}s, "
                    f"viewport={config.viewport_width}x{config.viewport_height}")
        
        output_dir = create_timestamped_dir(args.output, args.url)
        logger.info(f"Output directory: {output_dir}")
        
        if args.dry_run:
            logger.info("Dry run mode - skipping analysis")
            logger.info("Configuration validated successfully")
            logger.info(f"Would analyze: {args.url}")
            logger.info(f"Would save results to: {output_dir}")
            return 0
        
        stats = RuntimeStats()
        
        logger.info("Starting analysis...")
        stats.start_phase("analysis")
        
        logger.warning(
            "Analysis functionality not yet implemented. "
            "This is a placeholder that confirms:"
        )
        logger.info("  ✓ Argument parsing works")
        logger.info("  ✓ Configuration validation passed")
        logger.info(f"  ✓ OpenAI API key is set: {'Yes' if config.openai_api_key else 'No'}")
        logger.info(f"  ✓ Output directory created: {output_dir}")
        logger.info("  ✗ Downstream implementation pending")
        
        duration = stats.end_phase("analysis")
        logger.debug(f"Analysis phase duration: {duration:.2f}s")
        
        total_duration = stats.finish()
        logger.info(f"Total execution time: {total_duration:.2f}s")
        
        logger.info("CLI execution completed successfully (with placeholder)")
        return 0
        
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        return 1
    except KeyboardInterrupt:
        logger.warning("Operation cancelled by user")
        return 130
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=args.verbose)
        return 1


if __name__ == "__main__":
    sys.exit(main())
